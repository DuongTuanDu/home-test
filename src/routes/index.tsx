import { Route, Routes } from "react-router-dom";

import homeRoute from "./common/home.route";
import LayoutAboutUs from "@/layouts/LayoutAboutUs";

export default (
  <Routes>
    <Route element={<LayoutAboutUs />}>{homeRoute}</Route>
  </Routes>
);
