import { Button, Typography } from "@mui/material"
import { getSafeReturnUrl } from "../utils/url"
import StandalonePage from "./StandalonePage"
import { useAuthState } from "react-admin"

/**
 * Landing spot after the flag form is submitted. The "back" link leaves the
 * SPA for whichever Open Food Facts page sent the user here, which App
 * recorded when the app first loaded.
 */
const ThanksPage = () => {
  const authState = useAuthState()

  return (
    <StandalonePage>
      <Typography variant="h3">Thanks for your feedback</Typography>
      <Typography variant="h5">
        We will review your feedback as soon as possible
      </Typography>
      <Button variant="outlined" href={getSafeReturnUrl()}>
        Back to Open Food Facts
      </Button>
      {authState.authenticated ?
        <Button variant="contained" href={"/tickets"}>
          See my other tickets
        </Button> : null}
    </StandalonePage>
  )
}

export default ThanksPage
