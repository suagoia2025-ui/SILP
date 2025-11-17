// src/UserManagement.jsx
import { useState, useEffect } from 'react';
import axios from 'axios';

function UserManagement({ token }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:8000/api/v1/users/', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUsers(response.data);
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, [token]);

  if (loading) return <p>Cargando usuarios...</p>;

  return (
    <div className="user-management">
      <h3>Gestión de Usuarios</h3>
      <ul className="users-list">
        {users.map(user => (
          <li key={user.id}>
            <strong>{user.first_name} {user.last_name}</strong> ({user.role})<br />
            <span>{user.email}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default UserManagement;