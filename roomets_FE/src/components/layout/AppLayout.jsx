import { Outlet, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";

import Navbar from "./Navbar";

const AppLayout = () => {
  const location = useLocation();

  return (
    <>
      <Navbar />

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
          <Outlet />
        </motion.main>
      </AnimatePresence>
    </>
  );
};

export default AppLayout;