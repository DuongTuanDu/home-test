import { Outlet } from "react-router-dom";

const Layout = () => {
  return (
    <div className="min-h-screen flex flex-col overflow-x-hidden">
      <div className="flex-grow min-h-screen">
        <Outlet />
      </div>
    </div>
  );
};

export default Layout;
