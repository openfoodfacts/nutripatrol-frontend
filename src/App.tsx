import {
  Route,
  Routes
} from "react-router-dom";
import { useState, useCallback, useRef, useEffect } from "react";
import off from "./off.ts";
//import { MODERATORS } from "./const/moderators.ts";
import axios from "axios";

import HomePage from './pages/HomePage.tsx'
import ImageModerationPage from './pages/ImageModerationPage.tsx'
import ModerationPage from './pages/ModerationPage.tsx'
import NonModeratorPage from './pages/NonModeratorPage.tsx'
import LoginPage from './pages/LoginPage.tsx'
import LayoutMenu from "./components/Layouts/LayoutMenu.tsx";
import LoginContext from "./contexts/login.tsx";
import NotFound from "./pages/NotFound.tsx";
import FlagFormPage from "./pages/FlagFormPage.tsx";
import FlagInfos from "./pages/FlagInfos.tsx";
import Tutorial from "./pages/Tutorial.tsx";
import ThanksPage from "./pages/ThanksPage.tsx";

export default function App() {

  // turn in to true to test the moderation page - it will always be logged in
  const devMode = (import.meta.env.VITE_DEVELOPPEMENT_MODE === "development");
  
  const [alertIsOpen, setAlertIsOpen] = useState(false);
  const [userState, setUserState] = useState(() => {
    if (devMode) {
      return {
        userName: "DEVMODE_USER",
        isLoggedIn: true,
        isModerator: true,
      };
    }
    return {
      userName: "",
      isLoggedIn: false,
      isModerator: false,
    };
  });
  

  const lastSeenCookie = useRef<string | null>(null);

  const refresh = useCallback(async () => {
    if (devMode) {
      setUserState({
        userName: "",
        isLoggedIn: true,
        isModerator: true,
      });
      setAlertIsOpen(true);
      return true;
    }
    // Get the session cookie
    const sessionCookie = off.getCookie("session");
    // If the session cookie is the same as the last seen cookie, return the current login state
    if (sessionCookie === lastSeenCookie.current) {
      setAlertIsOpen(false);
      return userState.isLoggedIn;
    }
    // If the session cookie is null, the user is not logged in    
    if (!sessionCookie) {
      setUserState({
        userName: "",
        isLoggedIn: false,
        isModerator: false,
      });
      setAlertIsOpen(false);
      lastSeenCookie.current = sessionCookie;
      return false;
    }
    // If the session cookie is not null, send a request to the server to check if the user is logged in
    const isLoggedIn = axios
      .get(`${import.meta.env.VITE_PO_URL}/cgi/auth.pl?body=1`, {
        withCredentials: true,
      })
      // If the request is successful, set the user state to logged in
      .then(response => {
        const cookieUserName = off.getUsername();
        const userData = response.data.user;
        console.log("userData: ", userData);
        
        setUserState({
          userName: cookieUserName,
          isLoggedIn: true,
          isModerator: userData.moderator === 1,
        })
        console.log("userState: ", userState);
        
        setAlertIsOpen(true);
        lastSeenCookie.current = sessionCookie;
        return true;
      })
      // If the request is not successful, set the user state to logged out
      .catch(() => {
        setUserState({
          userName: "",
          isLoggedIn: false,
          isModerator: false,
        })
        console.log("check failed");
        
        setAlertIsOpen(false);
        lastSeenCookie.current = sessionCookie;
        return false;
      });
    return isLoggedIn;
  }, [userState.isLoggedIn]);

  useEffect(() => {
    refresh(); 
  }, [refresh]);

  return (
      <LoginContext.Provider value={{ ...userState, refresh }}>
          <LayoutMenu 
            alertIsOpen={alertIsOpen} 
            setAlertIsOpen={setAlertIsOpen} 
          >
            <Routes>
              {/* Index */}
              <Route path="/" element={<HomePage />} />
              <Route path="/flag" element={<FlagInfos />} />
              <Route path="/tutorial" element={<Tutorial />} />
              {/* LoggedIn routes (user) */}
              <Route
                path="/flag/product/"
                element={
                  userState.isLoggedIn ? (
                    <FlagFormPage type_="product" />
                  ) : (
                    <LoginPage />
                  )
                }
              />
              <Route
                path="/flag/image/"
                element={
                  userState.isLoggedIn ? (
                    <FlagFormPage type_="image" />
                  ) : (
                    <LoginPage />
                  )
                }
              />
              {/* LoggedIn routes (moderator) */}
              <Route
                path="/image-moderation"
                element={
                  userState.isLoggedIn ? (
                    userState.isModerator ? (
                      <ImageModerationPage />
                    ) : (
                      <NonModeratorPage />
                    )
                  ) : (
                    <LoginPage />
                  )
                }
              />
              <Route
                path="/moderation"
                element={
                  userState.isLoggedIn ? (
                    userState.isModerator ? (
                      <ModerationPage />
                    ) : (
                      <NonModeratorPage />
                    )
                  ) : (
                    <LoginPage />
                  )
                }
              />
              {/* Non LoggedIn routes */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/thanks" element={<ThanksPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </LayoutMenu>
      </LoginContext.Provider>
    )
}