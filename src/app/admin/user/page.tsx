import React from "react";
import AddUserDialog from "./components/add-user-dialog";
import UserTable from "./components/user-table";

const User = () => {
  return (
    <>
      <h2 className="text-3xl font-bold tracking-tight first:mt-0">
        Pengguna
      </h2>

      <div className="flex justify-end mt-4">
        <AddUserDialog />
      </div>

      <div className="mt-2">
        <UserTable />
      </div>
    </>
  );
};

export default User;
