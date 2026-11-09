import axios, { AxiosError } from "axios";
import { HttpError } from "react-admin";
import type { DataProvider, Identifier } from "react-admin";

const apiUrl = import.meta.env.VITE_API_URL;

// The API's GET /tickets filter param for the issue type is `type_` (a
// reserved-word workaround), while the field on the returned record - and
// the sort_by whitelist - is `type`. Every other filter/sort field name
// matches the record field name directly.
const FILTER_PARAM_NAMES: Record<string, string> = {
  type: "type_",
};

function buildListQuery(params: {
  pagination: { page: number; perPage: number };
  sort: { field: string; order: "ASC" | "DESC" };
  filter: Record<string, unknown>;
}): string {
  const query = new URLSearchParams();
  query.set("page", String(params.pagination.page));
  query.set("page_size", String(params.pagination.perPage));
  query.set("sort_by", params.sort.field);
  query.set("sort_order", params.sort.order.toLowerCase());

  for (const [key, value] of Object.entries(params.filter)) {
    if (value === undefined || value === null || value === "") continue;
    const paramName = FILTER_PARAM_NAMES[key] ?? key;
    if (Array.isArray(value)) {
      value.forEach((v) => query.append(paramName, String(v)));
    } else {
      query.set(paramName, String(value));
    }
  }
  return query.toString();
}

// Normalizes axios errors into react-admin's expected HttpError shape, so
// authProvider.checkError can react to the status code.
async function request<T>(promise: Promise<{ data: T }>): Promise<T> {
  try {
    const response = await promise;
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<{ detail?: string }>;
    const status = axiosError.response?.status ?? 0;
    const message = axiosError.response?.data?.detail ?? axiosError.message;
    throw new HttpError(message, status, axiosError.response?.data);
  }
}

function notImplemented(method: string): never {
  throw new HttpError(`${method} is not supported by the nutripatrol API`, 501);
}

/** A comment a moderator wrote on a ticket. */
export interface TicketComment {
  id: number;
  ticket_id: number;
  /** The `comment` action the comment was recorded with. */
  moderator_action_id: number;
  user_id: string;
  text: string;
  created_at: string;
}

/** The colors a label can take: the MUI palette, which Chip accepts as is. */
export type LabelColor =
  | "default"
  | "primary"
  | "secondary"
  | "error"
  | "info"
  | "success"
  | "warning";

/**
 * A label moderators put on tickets. Shared between tickets, and never
 * deleted - only renamed or recolored.
 */
export interface Label {
  id: number;
  name: string;
  color: LabelColor | null;
  created_by: string;
  created_at: string;
  /** How many tickets have it - only GET /labels says. */
  ticket_count?: number;
}

/** The two statuses a ticket can be closed with, with or without a comment. */
export type ClosedStatus = "closed-no-issue" | "closed-fixed";

export interface ModeratorAction {
  id: number;
  /**
   * The ticket status the action set, or `comment` - see actionTypeChoices.
   */
  action_type: string;
  user_id: string;
  ticket_id: number;
  created_at: string;
  /** The comment, on a `comment` action. */
  comment?: TicketComment | null;
  /** The label, on `label_added` and `label_removed` actions. */
  label?: Label | null;
}

/**
 * A report, as one person filed it.
 *
 * A ticket is the moderator's unit of work and gathers every report about the
 * same product or image, so this is where the human part lives.
 */
export interface Flag {
  id: number;
  ticket_id: number;
  barcode: string | null;
  /**
   * The selected type of issue. Technically could be anything, but we suggest values.
   */
  type: string;
  url: string;
  user_id: string;
  device_id: string;
  source: string;
  confidence: number | null;
  image_id: string | null;
  flavor: string;
  /**
   * Why the flag was raised. One of the taxonomy's values in
   * src/const/flagsConst.ts - but stored as free text, so flags from Robotoff
   * and from older forms hold values no current list mentions.
   */
  reason: string | null;
  comment: string | null;
  /**
   * Structured details whose keys depend on `reason` - the backend's
   * app/flag_extra_data.py lists them. Absent when the reporter answered
   * none of the reason's questions.
   */
  extra_data?: Record<string, unknown> | null;
  product_revision: number | null;
  created_at: string;
}

/**
 * A flag as POST /flags/batch returns it.
 *
 * That route serializes peewee rows as they come, so the ticket foreign key
 * arrives under its Python attribute name, `ticket`. The other flag routes go
 * through the API's own response model and publish it as `ticket_id`; asFlag
 * settles on the latter, so that nothing downstream has to know which route a
 * flag came from.
 */
type RawFlag = Omit<Flag, "ticket_id"> & { ticket?: number; ticket_id?: number };

function asFlag({ ticket, ...flag }: RawFlag): Flag {
  return { ...flag, ticket_id: flag.ticket_id ?? ticket ?? 0 };
}

interface Ticket {
  id: number;
  barcode: string | null;
  type: string;
  url: string;
  status: string;
  image_id: string | null;
  flavor: string;
  created_at: string;
  /** How many comments moderators wrote on the ticket. */
  comment_count?: number;
  /** Its labels - always empty for a non-moderator. */
  labels?: Label[];
}

/**
 * Every label. There are few of them, and GET /labels takes no parameter, so
 * the label resource below pages, sorts and searches them here.
 */
async function getAllLabels(): Promise<Label[]> {
  const data = await request<{ labels?: Label[] }>(
    axios.get(`${apiUrl}/labels`, { withCredentials: true }),
  );
  return data.labels ?? [];
}

// Built as a concretely-typed provider rather than the generic RecordType
// react-admin's DataProvider interface expects per method - `as
// DataProvider` documents the intended shape without fighting TS variance
// on a provider this small. Correctness is still enforced by the Ticket /
// ModeratorAction typing used throughout (request<Ticket>, etc.) above.
//
// "tickets" and "labels" are the writable resources; "moderator_actions" is
// list-only, since the API has no per-action route. Labels cannot be
// deleted, so their `delete` stays unsupported like everything else's.
export const dataProvider = {
  getList: async (resource, params) => {
    if (resource === "moderator_actions") {
      // The API exposes only the caller's own actions, already ordered
      // created_at desc, so pagination is the only parameter it accepts -
      // buildListQuery's sort/filter params would be ignored.
      const { page, perPage } = (
        params as { pagination: { page: number; perPage: number } }
      ).pagination;
      const data = await request<{ actions: ModeratorAction[]; total: number }>(
        axios.get(
          `${apiUrl}/moderator_actions/me?page=${page}&page_size=${perPage}`,
          { withCredentials: true },
        ),
      );
      return { data: data.actions, total: data.total };
    }
    if (resource === "labels") {
      // AutocompleteArrayInput searches with `q`.
      const { filter } = params as { filter?: { q?: string } };
      const q = filter?.q?.trim().toLowerCase();
      const labels = (await getAllLabels()).filter(
        (label) => !q || label.name.toLowerCase().includes(q),
      );
      return { data: labels, total: labels.length };
    }
    if (resource !== "tickets") notImplemented("getList");
    const query = buildListQuery(params as any);
    const data = await request<{ tickets: Ticket[]; total: number }>(
      axios.get(`${apiUrl}/tickets?${query}`, { withCredentials: true }),
    );
    return { data: data.tickets, total: data.total };
  },

  getOne: async (resource, params) => {
    if (resource === "labels") {
      const label = (await getAllLabels()).find(
        (label) => String(label.id) === String(params.id),
      );
      if (!label) throw new HttpError("Label not found", 404);
      return { data: label };
    }
    if (resource !== "tickets") notImplemented("getOne");
    const data = await request<Ticket>(
      axios.get(`${apiUrl}/tickets/${params.id}`, { withCredentials: true }),
    );
    return { data };
  },

  getMany: async (resource, params) => {
    if (resource === "labels") {
      const ids = new Set(params.ids.map(String));
      const labels = await getAllLabels();
      return { data: labels.filter((label) => ids.has(String(label.id))) };
    }
    if (resource !== "tickets") notImplemented("getMany");
    const data = await Promise.all(
      params.ids.map((id) =>
        request<Ticket>(
          axios.get(`${apiUrl}/tickets/${id}`, { withCredentials: true }),
        ),
      ),
    );
    return { data };
  },

  update: async (resource, params) => {
    if (resource === "labels") {
      const { name, color } = params.data as Partial<Label>;
      const data = await request<Label>(
        axios.patch(
          `${apiUrl}/labels/${params.id}`,
          { name, color },
          { withCredentials: true },
        ),
      );
      return { data };
    }
    if (resource !== "tickets") notImplemented("update");
    // Status is the only field the API allows updating - forward only that,
    // regardless of what else is present in params.data.
    const status = (params.data as Partial<Ticket>).status;
    const data = await request<Ticket>(
      axios.put(
        `${apiUrl}/tickets/${params.id}/status?status=${status}`,
        null,
        { withCredentials: true },
      ),
    );
    return { data };
  },

  getManyReference: async () => notImplemented("getManyReference"),

  /**
   * Only labels are created through react-admin. Creating a name that exists
   * already, whatever its case, returns that label.
   */
  create: async (resource, params) => {
    if (resource !== "labels") notImplemented("create");
    const { name, color } = params.data as Partial<Label>;
    const data = await request<Label>(
      axios.post(
        `${apiUrl}/labels`,
        { name, color },
        { withCredentials: true },
      ),
    );
    return { data };
  },
  delete: async () => notImplemented("delete"),
  deleteMany: async () => notImplemented("deleteMany"),
  updateMany: async () => notImplemented("updateMany"),

  // Flags and moderator actions hang off a ticket rather than standing on
  // their own - neither has a route that takes a ticket filter, so neither
  // fits getList. They are custom methods instead, called through
  // useDataProvider so that their failures still reach authProvider.checkError
  // like every other call here.

  /**
   * The flags of several tickets at once, keyed by ticket id (as a string -
   * they are JSON object keys).
   *
   * One request for a whole page of tickets, because the alternative is one
   * per row. A ticket the caller may not read is simply absent from the
   * answer, and a non-moderator gets only their own flags on the tickets they
   * did flag.
   */
  getFlagsByTicket: async (ticketIds: number[]) => {
    const data = await request<{
      ticket_id_to_flags?: Record<string, RawFlag[]>;
    }>(
      axios.post(
        `${apiUrl}/flags/batch`,
        { ticket_ids: ticketIds },
        { withCredentials: true },
      ),
    );
    // `?? {}` covers react-admin's proxy, which swallows the response and
    // hands back `{}` when an error ended in a logout.
    const byTicket = data.ticket_id_to_flags ?? {};
    return Object.fromEntries(
      Object.entries(byTicket).map(([ticketId, flags]) => [
        ticketId,
        flags.map(asFlag),
      ]),
    );
  },

  /** One ticket's moderation history, most recent first. */
  getTicketActions: async (ticketId: Identifier, page = 1, perPage = 100) => {
    const data = await request<{ actions?: ModeratorAction[]; total?: number }>(
      axios.get(
        `${apiUrl}/tickets/${ticketId}/actions?page=${page}&page_size=${perPage}`,
        { withCredentials: true },
      ),
    );
    return { actions: data.actions ?? [], total: data.total ?? 0 };
  },

  /** Put a label on a ticket. Returns the ticket, with its labels. */
  addTicketLabel: async (ticketId: Identifier, labelId: Identifier) =>
    request<Ticket>(
      axios.post(`${apiUrl}/tickets/${ticketId}/labels/${labelId}`, null, {
        withCredentials: true,
      }),
    ),

  /** Take a label off a ticket. Returns the ticket, with its labels. */
  removeTicketLabel: async (ticketId: Identifier, labelId: Identifier) =>
    request<Ticket>(
      axios.delete(`${apiUrl}/tickets/${ticketId}/labels/${labelId}`, {
        withCredentials: true,
      }),
    ),

  /** One ticket's comments, oldest first. */
  getTicketComments: async (ticketId: Identifier) => {
    const data = await request<{ comments?: TicketComment[]; total?: number }>(
      axios.get(`${apiUrl}/tickets/${ticketId}/comments`, {
        withCredentials: true,
      }),
    );
    return { comments: data.comments ?? [], total: data.total ?? 0 };
  },

  /** Comment on a ticket, without changing its status. */
  addTicketComment: async (ticketId: Identifier, text: string) =>
    request<TicketComment>(
      axios.post(
        `${apiUrl}/tickets/${ticketId}/comments`,
        { text },
        { withCredentials: true },
      ),
    ),

  /**
   * Comment on a ticket and close it. The API records the comment, then the
   * close, as two actions.
   */
  closeTicketWithComment: async (
    ticketId: Identifier,
    status: ClosedStatus,
    comment: string,
  ) =>
    request<Ticket>(
      axios.post(
        `${apiUrl}/tickets/${ticketId}/close_with_comment`,
        { status, comment },
        { withCredentials: true },
      ),
    ),
} as NutriPatrolDataProvider;

/**
 * The react-admin provider plus the ticket-scoped methods above. Components
 * ask for it explicitly - `useDataProvider<NutriPatrolDataProvider>()` - since
 * the plain DataProvider type knows nothing of them.
 */
export type NutriPatrolDataProvider = DataProvider & {
  getFlagsByTicket: (ticketIds: number[]) => Promise<Record<string, Flag[]>>;
  getTicketActions: (
    ticketId: Identifier,
    page?: number,
    perPage?: number,
  ) => Promise<{ actions: ModeratorAction[]; total: number }>;
  getTicketComments: (
    ticketId: Identifier,
  ) => Promise<{ comments: TicketComment[]; total: number }>;
  addTicketComment: (
    ticketId: Identifier,
    text: string,
  ) => Promise<TicketComment>;
  closeTicketWithComment: (
    ticketId: Identifier,
    status: ClosedStatus,
    comment: string,
  ) => Promise<Ticket>;
  addTicketLabel: (ticketId: Identifier, labelId: Identifier) => Promise<Ticket>;
  removeTicketLabel: (
    ticketId: Identifier,
    labelId: Identifier,
  ) => Promise<Ticket>;
};
