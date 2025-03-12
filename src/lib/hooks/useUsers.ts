import { useState, useEffect, useCallback } from "react";
import {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  User,
  UserInsert,
  UserUpdate,
} from "../api/users";

export function useUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getUsers();
      setUsers(data);
      setError(null);
    } catch (err) {
      setError(err as Error);
      console.error("Error fetching users:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const addUser = useCallback(async (user: UserInsert, password?: string) => {
    try {
      const newUser = await createUser(user, password);
      setUsers((prevUsers) => [...prevUsers, newUser]);
      return newUser;
    } catch (err) {
      console.error("Error adding user:", err);
      throw err;
    }
  }, []);

  const editUser = useCallback(async (id: string, user: UserUpdate) => {
    try {
      const updatedUser = await updateUser(id, user);
      setUsers((prevUsers) =>
        prevUsers.map((u) => (u.id === id ? updatedUser : u)),
      );
      return updatedUser;
    } catch (err) {
      console.error("Error updating user:", err);
      throw err;
    }
  }, []);

  const removeUser = useCallback(async (id: string) => {
    try {
      await deleteUser(id);
      setUsers((prevUsers) => prevUsers.filter((user) => user.id !== id));
      return true;
    } catch (err) {
      console.error("Error removing user:", err);
      throw err;
    }
  }, []);

  return {
    users,
    loading,
    error,
    fetchUsers,
    addUser,
    editUser,
    removeUser,
  };
}
