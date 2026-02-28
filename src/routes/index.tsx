import { Route, Routes } from "react-router-dom";

import homeRoute from "./common/home.route";
import Layout from "@/layouts/Layout";

export default (
  <Routes>
    <Route element={<Layout />}>{homeRoute}</Route>
  </Routes>
);
