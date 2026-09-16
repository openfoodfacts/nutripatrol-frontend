import axios, { AxiosError } from "axios";
import { HttpError } from "react-admin";
import type { DataProvider } from "react-admin";

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

interface ModeratorAction {
  id: number;
  action_type: string;
  user_id: string;
  ticket_id: number;
  created_at: string;
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
}

// Built as a concretely-typed provider rather than the generic RecordType
// react-admin's DataProvider interface expects per method - `as
// DataProvider` documents the intended shape without fighting TS variance
// on a provider this small. Correctness is still enforced by the Ticket /
// ModeratorAction typing used throughout (request<Ticket>, etc.) above.
//
// "tickets" is the only writable resource; "moderator_actions" is
// list-only, since the API has no per-action route.
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
    if (resource !== "tickets") notImplemented("getList");
    const query = buildListQuery(params as any);
    const data = await request<{ tickets: Ticket[]; total: number }>(
      axios.get(`${apiUrl}/tickets?${query}`, { withCredentials: true }),
    );
    return { data: data.tickets, total: data.total };
  },

  getOne: async (resource, params) => {
    if (resource !== "tickets") notImplemented("getOne");
    const data = await request<Ticket>(
      axios.get(`${apiUrl}/tickets/${params.id}`, { withCredentials: true }),
    );
    return { data };
  },

  getMany: async (resource, params) => {
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
  create: async () => notImplemented("create"),
  delete: async () => notImplemented("delete"),
  deleteMany: async () => notImplemented("deleteMany"),
  updateMany: async () => notImplemented("updateMany"),
} as DataProvider;
