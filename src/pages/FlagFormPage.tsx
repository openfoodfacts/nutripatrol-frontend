import {
    Alert,
    Typography,
    Container,
    TextField,
    Select,
    MenuItem,
    Button,
    InputLabel,
    FormControl,
    Link,
} from '@mui/material';
import axios from 'axios';
import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useGetIdentity } from 'react-admin';
import {
    reasonsForType,
    reasonSpec,
    sources,
    flavors,
    projects,
    projectSpec,
    SCORE_DISPUTE_NOTICE,
} from '../const/flagsConst';
import type { IssueType } from '../const/flagsConst';
import { trackEvent } from '../analytics';
import ThanksPage from './ThanksPage';
import CorrectProductBarcode from '../components/CorrectProductBarcode';
import { isProductBarcode } from '../utils/barcode';
import { Image, ImagesContext } from '../components/productImages';

/**
 * Interfaces
 */
interface FlagFormProps {
    type_: IssueType;
}

interface FormData {
    barcode: string;
    type: IssueType;
    image_id?: string;
    source: string;
    flavor: string;
    reason: string;
    comment: string;
    /** For `not_a_product`: the project the product belongs on, if known. */
    correct_flavor: string;
    correct_barcode: string;
}

export default function FlagForm({ type_ }: FlagFormProps) {

    const [searchParams] = useSearchParams();
    // The route is wrapped in AdminApp's <SignedIn>, so by the time the form
    // can be submitted the authProvider has an identity to report. It still
    // arrives asynchronously, hence reading it at submit time rather than
    // freezing it into the initial form state.
    const { identity } = useGetIdentity();
    const barcode = searchParams.get('barcode') || undefined;
    const source = searchParams.get('source') || undefined;
    const flavor = searchParams.get('flavor') || undefined;
    const image_id = searchParams.get('image_id') || undefined;
    const comment = searchParams.get('comment') || undefined;
    const reason = searchParams.get('reason') || undefined;

    const [flagSent, setFlagSent] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [sending, setSending] = useState(false)

    const [formData, setFormData] = useState<FormData>({
        barcode: barcode || "", // only for product and image
        type: type_, // product, image, search
        image_id: image_id, // only for image
        source: source || "", // not in the form
        flavor: flavor || "", // not in the form
        // Prefilled when the link that brought the person here already knows
        // what they are reporting - Open Food Facts has a button per problem.
        reason: reasonSpec(reason)?.types.includes(type_) ? reason! : "",
        comment: comment || "",
        correct_flavor: "",
        correct_barcode: "",
    });

    if (source === undefined || !sources.includes(source) || flavor === undefined || !flavors.includes(flavor)) {
        return (
            <Container maxWidth='lg'>
                <Typography variant="h4" sx={{ margin: '4rem 0', fontSize: { xs: '1.2rem', md: '1.7rem' }, fontWeight: 700 }}>
                    Error: Wrong source or flavor
                </Typography>
            </Container>
        )
    }

    const spec = reasonSpec(formData.reason);

    const handleChange = (e: any) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name as string]: value,
        }));
    };

    // Reports about a computed score: the number cannot be edited, only the
    // data under it. Said here rather than in the general advice above the
    // form, because 79 people read that advice and reported it anyway.
    const disputesAScore =
        formData.reason === "wrong_data" &&
        /nutri.?score|nova/i.test(formData.comment);

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);
        const { correct_flavor, correct_barcode, ...flag } = formData;
        const targetBarcode = flag.reason === "wrong_product" ? correct_barcode.trim() : "";
        if (targetBarcode && (!isProductBarcode(targetBarcode) || targetBarcode === flag.barcode)) {
            setError("Enter a different barcode with 4 to 30 digits, or leave it blank.");
            return;
        }
        setSending(true);
        const url = `${import.meta.env.VITE_API_URL}/flags`;
        const body = {
            ...flag,
            user_id: String(identity?.id ?? ""), // not in the form
        };
        // Optional, and only meaningful for the reason that asks it: the
        // API refuses extra_data a reason does not take.
        const correctFlavor = flag.reason === "not_a_product" ? projectSpec(correct_flavor) : undefined;
        const send = correctFlavor
            ? axios.post(url, { ...body, extra_data: { correct_flavor } }, { withCredentials: true })
                // An API that predates `correct_flavor` refuses the whole
                // report over it. The report matters more than the field, so
                // it goes again with the answer in the comment, where a
                // moderator still reads it.
                .catch((err) => {
                    if (err?.response?.status !== 422) throw err;
                    const note = `Belongs on ${correctFlavor.label}.`;
                    return axios.post(url, {
                        ...body,
                        comment: body.comment ? `${body.comment}\n\n${note}` : note,
                    }, { withCredentials: true });
                })
            : axios.post(url, targetBarcode
                ? { ...body, extra_data: { correct_barcode: targetBarcode } }
                : body, { withCredentials: true });
        send
            .then(() => {
                trackEvent("Flag", "submit_flag", formData.barcode);
                setFlagSent(true);
            })
            // Reporting a failure is the whole point of the catch: without one
            // a rejected report showed the thank-you page, so a duplicate or a
            // rejected value looked exactly like a report that went through.
            .catch((err) => {
                setSending(false);
                setError(
                    err?.response?.status === 409
                        ? "You have already reported this for that reason. Thank you - a moderator will look at it."
                        : err?.response?.data?.detail
                            ? `Your report could not be sent: ${typeof err.response.data.detail === "string"
                                ? err.response.data.detail
                                : "some of the details were not accepted."
                            }`
                            : "Your report could not be sent. Please try again.",
                );
            });
    };


    if (flagSent) {
        return <ThanksPage />
    }

    /* FORM FOR PRODUCT */
    return (
        <Container sx={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }} >
            <Typography variant='h4'>
                {type_ === 'product' ? 'Flag a product' : 'Flag an image'}
            </Typography>
            <Typography variant="body1" sx={{margin: '2rem 0', fontSize: {xs: '0.8rem', md: '1.2rem'}}}>
                Use Nutripatrol to report inconsistencies between our website's product information or images, and data gleaned from the actual packaging. For any other concern or question please use the <a href="https://slack.openfoodfacts.org/">Slack forums</a>.
            </Typography>
            <Typography variant="body1" sx={{margin: '2rem 0', fontSize: {xs: '0.8rem', md: '1.2rem'}}}>
                Moderators will never contact you, so please give all the relevant details in your report. Pick the reason that fits best.
            </Typography>
            {type_ === 'image' && formData.barcode && formData.image_id && (
                <ImagesContext barcode={formData.barcode} flavor={flavor}>
                    <Image
                        imgid={formData.image_id}
                        width={250}
                        fit="contain"
                        showInfo
                        alt="The reported picture"
                        sx={{ my: 4 }}
                    />
                </ImagesContext>
            )}
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', width: '70%' }}>
                <TextField
                    name="barcode"
                    label="Barcode"
                    value={formData.barcode}
                    onChange={handleChange}
                    fullWidth
                    disabled
                    margin="normal"
                    required
                />
                <FormControl fullWidth margin="normal">
                    <InputLabel id="reason">Reason *</InputLabel>
                    <Select
                        labelId='reason'
                        name="reason"
                        label="Reason *"
                        value={formData.reason}
                        onChange={handleChange}
                        fullWidth
                        required
                    >
                        {reasonsForType(type_).map((reason) => (
                            <MenuItem key={reason.value} value={reason.value}>
                                {reason.label}
                            </MenuItem>
                        ))
                        }
                    </Select>
                </FormControl>

                {/* The advice each reason needs, next to the question it
                answers, instead of one list of everything shown at once. */}
                {spec?.hint && (
                    <Alert severity="info" sx={{ width: '100%', mt: 1 }}>
                        {spec.hint}
                    </Alert>
                )}
                {/* Optional: lets a moderator move the product in one click
                instead of working out where it should go. */}
                {formData.reason === "not_a_product" && (
                    <FormControl fullWidth margin="normal">
                        <InputLabel id="correct_flavor">Where does it belong?</InputLabel>
                        <Select
                            labelId="correct_flavor"
                            name="correct_flavor"
                            label="Where does it belong?"
                            value={formData.correct_flavor}
                            onChange={handleChange}
                        >
                            <MenuItem value=""><em>I don't know / none of these</em></MenuItem>
                            {/* The pro platform is Open Food Facts seen by
                            producers, so a product there is already on it. */}
                            {projects
                                .filter((project) => project.value !== (flavor === "off-pro" ? "off" : flavor))
                                .map((project) => (
                                    <MenuItem key={project.value} value={project.value}>
                                        {project.label}
                                    </MenuItem>
                                ))}
                        </Select>
                    </FormControl>
                )}
                {formData.reason === "wrong_product" && (
                    <CorrectProductBarcode
                        value={formData.correct_barcode}
                        currentBarcode={formData.barcode}
                        flavor={formData.flavor}
                        onChange={(value) => setFormData((previous) => ({ ...previous, correct_barcode: value }))}
                    />
                )}
                {spec?.outOfScope && (
                    <Alert severity="warning" sx={{ width: '100%', mt: 1 }}>
                        {spec.outOfScope.message}{' '}
                        <Link href={spec.outOfScope.href} target="_blank" rel="noopener">
                            {spec.outOfScope.linkLabel}
                        </Link>
                        . You can still send this report.
                    </Alert>
                )}
                {disputesAScore && (
                    <Alert severity="warning" sx={{ width: '100%', mt: 1 }}>
                        {SCORE_DISPUTE_NOTICE.message}{' '}
                        <Link href={SCORE_DISPUTE_NOTICE.href} target="_blank" rel="noopener">
                            {SCORE_DISPUTE_NOTICE.linkLabel}
                        </Link>
                        .
                    </Alert>
                )}

                <TextField
                    name="comment"
                    label="Anything else we should know?"
                    value={formData.comment}
                    onChange={handleChange}
                    fullWidth
                    multiline
                    minRows={3}
                    margin="normal"
                />
                {error && (
                    <Alert severity="error" sx={{ width: '100%', mt: 1 }}>
                        {error}
                    </Alert>
                )}
                <Button type="submit" variant="contained" color="success" disabled={sending} sx={{ margin: '1rem 0', width: '15rem' }}>
                    {sending ? 'Sending…' : `Flag ${type_}`}
                </Button>
            </form>
        </Container>
    )
}
