import { forwardRef } from "react";
import { ListItemIcon, ListItemText, MenuItem } from "@mui/material";
import LogoutIcon from "@mui/icons-material/PowerSettingsNew";
import { AppBar, UserMenu, useLogout, useUserMenu } from "react-admin";
import type { AppBarProps } from "react-admin";

/**
 * The user menu's "Logout", replacing react-admin's own.
 *
 * The only difference is `userInitiated`: react-admin calls
 * authProvider.logout() for failed auth checks as well as for this click, and
 * the two want opposite things from the shared Open Food Facts session - see
 * authProvider.logout. Its own Logout button passes nothing, so the provider
 * could not tell them apart and ended up keeping a contributor signed in.
 *
 * `false` as the third argument keeps the current page out of the login page's
 * router state: someone who asked to leave should not be sent back to where
 * they were the moment they sign in again.
 */
const SignOut = forwardRef<HTMLLIElement>(function SignOut(props, ref) {
  const logout = useLogout();
  const { onClose } = useUserMenu() ?? {};

  return (
    <MenuItem
      ref={ref}
      {...props}
      onClick={() => {
        onClose?.();
        logout({ userInitiated: true }, undefined, false);
      }}
    >
      <ListItemIcon>
        <LogoutIcon fontSize="small" />
      </ListItemIcon>
      <ListItemText>Logout</ListItemText>
    </MenuItem>
  );
});

/**
 * react-admin's app bar, with SignOut in place of the default user menu's
 * Logout. Everything else about it is untouched.
 */
export default function AdminAppBar(props: AppBarProps) {
  return (
    <AppBar
      {...props}
      userMenu={
        <UserMenu>
          <SignOut />
        </UserMenu>
      }
    />
  );
}
