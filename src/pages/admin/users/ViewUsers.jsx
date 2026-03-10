import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { Button, Modal, Space, Tag, message } from "antd";
import AppTable from "../../../components/AppTable";
import { blockUser, deleteUser, listUsers, unblockUser } from "../../../api/user";
import AddUser from "./AddUser";
import EditUser from "./EditUser";

function normalizeUser(u) {
  if (!u || typeof u !== "object") return null;
  return {
    _id: u._id ?? u.id,
    name: u.name ?? "",
    email: u.email ?? u.email_id ?? "",
    role: u.role ?? "",
    venueId: u.venueId ?? null,
    venueName: u.venue?.name ?? null,
    blocked:
      u.blocked ??
      u.isBlocked ??
      u.is_blocked ??
      (typeof u.status === "string"
        ? u.status.toLowerCase() === "blocked"
        : false),
  };
}

function asUsersArray(apiData) {
  if (Array.isArray(apiData)) return apiData;
  if (Array.isArray(apiData?.users)) return apiData.users;
  if (Array.isArray(apiData?.data)) return apiData.data;
  return [];
}

export default function ViewUsers() {
  const accessToken = useSelector((state) => state.user.value.access_token);
  const [msgApi, contextHolder] = message.useMessage();

  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);

  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  const refresh = useCallback(async () => {
    if (!accessToken) return;
    setLoading(true);
    try {
      const data = await listUsers(accessToken);
      const arr = asUsersArray(data).map(normalizeUser).filter(Boolean);
      setUsers(arr);
    } catch (err) {
      msgApi.error(err?.response?.data?.message ?? "Failed to load users");
    } finally {
      setLoading(false);
    }
  }, [accessToken, msgApi]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const openEdit = useCallback((u) => {
    setEditingUser(u);
    setEditOpen(true);
  }, []);

  const confirmDelete = useCallback(
    (u) => {
      Modal.confirm({
        centered: true,
        title: "Delete user?",
        content: `This will permanently delete ${u?.email || "this user"}.`,
        okText: "Delete",
        okButtonProps: { danger: true },
        cancelText: "Cancel",
        onOk: async () => {
          if (!u?._id) return;
          try {
            await deleteUser(u._id, accessToken);
            msgApi.success("User deleted");
            await refresh();
          } catch (err) {
            msgApi.error(err?.response?.data?.message ?? "Failed to delete user");
          }
        },
      });
    },
    [accessToken, msgApi, refresh]
  );

  const confirmBlockToggle = useCallback(
    (u) => {
      const isBlocked = !!u?.blocked;
      Modal.confirm({
        centered: true,
        title: isBlocked ? "Unblock user?" : "Block user?",
        content: isBlocked
          ? `This will allow ${u?.email || "this user"} to access the app again.`
          : `This will prevent ${u?.email || "this user"} from accessing the app.`,
        okText: isBlocked ? "Unblock" : "Block",
        okButtonProps: isBlocked ? {} : { danger: true },
        cancelText: "Cancel",
        onOk: async () => {
          if (!u?._id) return;
          try {
            if (isBlocked) await unblockUser(u._id, accessToken);
            else await blockUser(u._id, accessToken);
            msgApi.success(isBlocked ? "User unblocked" : "User blocked");
            await refresh();
          } catch (err) {
            msgApi.error(err?.response?.data?.message ?? "Failed to update user status");
          }
        },
      });
    },
    [accessToken, msgApi, refresh]
  );

  const columns = useMemo(() => {
    return [
      {
        title: "Name",
        dataIndex: "name",
        key: "name",
        render: (v) => (
          <span className="font-medium text-[#1a1917]">{v || "-"}</span>
        ),
      },
      {
        title: "Email",
        dataIndex: "email",
        key: "email",
        render: (v) => <span className="text-[#6b6966]">{v || "-"}</span>,
      },
      {
        title: "Role",
        dataIndex: "role",
        key: "role",
        width: 120,
        render: (v) => {
          const role = (v || "").toLowerCase();
          const color = role === "admin" ? "purple" : "green";
          return <Tag color={color}>{role || "-"}</Tag>;
        },
      },
      {
        title: "Venue",
        dataIndex: "venueName",
        key: "venueName",
        width: 220,
        render: (v) => <span className="text-[#6b6966]">{v || "-"}</span>,
      },
      {
        title: "Status",
        key: "status",
        width: 120,
        render: (_, u) =>
          u?.blocked ? (
            <Tag color="red">Blocked</Tag>
          ) : (
            <Tag color="blue">Active</Tag>
          ),
      },
      {
        title: "Actions",
        key: "actions",
        width: 240,
        render: (_, u) => (
          <Space>
            <Button onClick={() => openEdit(u)} type="default">
              Edit
            </Button>
            <Button onClick={() => confirmBlockToggle(u)} danger={!u?.blocked}>
              {u?.blocked ? "Unblock" : "Block"}
            </Button>
            <Button onClick={() => confirmDelete(u)} danger>
              Delete
            </Button>
          </Space>
        ),
      },
    ];
  }, [confirmBlockToggle, confirmDelete, openEdit]);

  return (
    <div className="flex flex-col w-full font-sans">
      {contextHolder}

      <div className="flex items-start justify-between gap-3 mb-3">
        <header>
          <p className="m-0 text-sm text-[#9a9896] font-medium">Admin</p>
          <h1 className="mt-1 m-0 text-2xl sm:text-[28px] font-bold text-[#1a1917] font-serif tracking-tight leading-tight">
            View Users
          </h1>
        </header>

        <div className="flex items-center gap-2">
          <Button onClick={refresh} type="default">
            Refresh
          </Button>
          <Button onClick={() => setAddOpen(true)} type="primary">
            Add User
          </Button>
        </div>
      </div>

      <AppTable
        columns={columns}
        dataSource={users}
        loading={loading}
        pagination={{ pageSize: 10, showSizeChanger: true }}
        scroll={{ x: 900 }}
      />

      <AddUser
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onSuccess={refresh}
      />

      <EditUser
        open={editOpen}
        onClose={() => {
          setEditOpen(false);
          setEditingUser(null);
        }}
        onSuccess={refresh}
        user={editingUser}
      />
    </div>
  );
}