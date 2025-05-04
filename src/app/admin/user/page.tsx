import React from "react";
import AddUserDialog from "./components/add-user-dialog";
import UserTable from "./components/user-table";

const User = () => {
  return (
    <>
      <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
        Pengguna
      </h1>

      <div className="flex justify-end mt-6">
        <AddUserDialog />
      </div>

      <div className="hidden md:block mt-4">
        <UserTable />
      </div>
    </>
  );
};

export default User;
