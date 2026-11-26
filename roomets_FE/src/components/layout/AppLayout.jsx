import { Suspense, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Box, CircularProgress } from "@mui/material";

import Navbar from "./Navbar";
import SessionNotice from "./SessionNotice";

const PageLoader = () => (
  <Box sx={{ display: "flex", justifyContent: "center", py: 10 }}>
    <CircularProgress sx={{ color: "#3730E8" }} />
  </Box>
);

const AppLayout = () => {
  const location = useLocation();

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const heading = document.querySelector("main h1");
      if (!heading) return;
      heading.setAttribute("tabindex", "-1");
      heading.focus({ preventScroll: true });
    }, 220);

    return () => window.clearTimeout(timer);
  }, [location.pathname]);

  return (
    <>
      <Navbar />
      <SessionNotice />

      <AnimatePresence mode="wait">
        <motion.main
          key={location.pathname}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{
            duration: 0.18,
            ease: [0.22, 1, 0.36, 1],
          }}
          style={{
            width: "100%",
            willChange: "opacity, transform",
          }}
        >
          <Suspense fallback={<PageLoader />}>
            <Outlet />
          </Suspense>
        </motion.main>
      </AnimatePresence>
    </>
  );
};

export default AppLayout;
