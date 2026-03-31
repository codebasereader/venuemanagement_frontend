import React, { useCallback, useEffect, useMemo } from "react";
import { useSelector } from "react-redux";
import { Button, Drawer, Form, Input, Select, Space, message } from "antd";
import { updateUser } from "../../../api/user";
import { listVenues } from "../../../api/venue";

function asVenuesArray(apiData) {
  if (Array.isArray(apiData)) return apiData;
  if (Array.isArray(apiData?.venues)) return apiData.venues;
  if (Array.isArray(apiData?.data)) return apiData.data;
  return [];
}

function normalizeVenue(v) {
  if (!v || typeof v !== "object") return null;
  return {
    _id: v._id ?? v.id,
    name: v.name ?? "",
    isActive: v.isActive ?? true,
  };
}

/** Roles that are scoped to a single venue (incharge + owner). */
const ROLES_WITH_VENUE = ["incharge", "owner"];

export default function EditUser({ open, onClose, onSuccess, user }) {
  const accessToken = useSelector((state) => state.user.value.access_token);
  const [msgApi, contextHolder] = message.useMessage();
  const [submitting, setSubmitting] = React.useState(false);
  const [form] = Form.useForm();

  const roleValue = Form.useWatch("role", form);
  const [venuesLoading, setVenuesLoading] = React.useState(false);
  const [venues, setVenues] = React.useState([]);

  useEffect(() => {
    if (roleValue && !ROLES_WITH_VENUE.includes(roleValue)) {
      form.setFieldValue("venueId", null);
    }
  }, [roleValue, form]);

  useEffect(() => {
    if (!open || !accessToken) return;
    setVenuesLoading(true);
    listVenues(accessToken)
      .then((data) => {
        const arr = asVenuesArray(data).map(normalizeVenue).filter(Boolean);
        setVenues(arr);
      })
      .catch(() => {})
      .finally(() => setVenuesLoading(false));
  }, [open, accessToken]);

  const venueOptions = useMemo(() => {
    return venues
      .filter((v) => v?.isActive !== false)
      .map((v) => ({ label: v.name || v._id, value: v._id }));
  }, [venues]);

  useEffect(() => {
    if (open && user) {
      form.setFieldsValue({
        name: user.name ?? "",
        email: user.email ?? "",
        role: user.role ?? "",
        venueId: user.venueId ?? null,
      });
    }
  }, [open, user, form]);

  const closeDrawer = useCallback(() => {
    form.resetFields();
    onClose?.();
  }, [form, onClose]);

  const handleSubmit = useCallback(async () => {
    if (!accessToken) return;
    if (!user?._id) {
      msgApi.error("Missing user ID");
      return;
    }
    setSubmitting(true);
    try {
      const values = await form.validateFields();
      const payload = {
        name: values.name?.trim(),
        email: values.email?.trim(),
        role: values.role,
        venueId: ROLES_WITH_VENUE.includes(values.role)
          ? values.venueId || null
          : null,
      };

      await updateUser(user._id, payload, accessToken);
      msgApi.success("User updated");
      closeDrawer();
      onSuccess?.();
    } catch (err) {
      if (err?.errorFields) return; // antd form validation
      msgApi.error(
        err?.response?.data?.message ?? err?.message ?? "Failed to update user"
      );
    } finally {
      setSubmitting(false);
    }
  }, [accessToken, closeDrawer, form, msgApi, onSuccess, user]);

  return (
    <>
      {contextHolder}
      <Drawer
        title="Edit User"
        open={open}
        onClose={closeDrawer}
        width={420}
        destroyOnClose={false}
        extra={
          <Space>
            <Button onClick={closeDrawer}>Cancel</Button>
            <Button type="primary" loading={submitting} onClick={handleSubmit}>
              Save
            </Button>
          </Space>
        }
      >
        <Form form={form} layout="vertical" requiredMark="optional">
          <Form.Item
            label="Name"
            name="name"
            rules={[{ required: true, message: "Name is required" }]}
          >
            <Input placeholder="Full name" />
          </Form.Item>

          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: "Email is required" },
              { type: "email", message: "Enter a valid email" },
            ]}
          >
            <Input placeholder="user@example.com" />
          </Form.Item>

          <Form.Item
            label="Role"
            name="role"
            rules={[{ required: true, message: "Role is required" }]}
          >
            <Select
              placeholder="Select role"
              options={[
                { label: "Admin", value: "admin" },
                { label: "Incharge", value: "incharge" },
                { label: "Owner", value: "owner" },
              ]}
            />
          </Form.Item>

          {ROLES_WITH_VENUE.includes(roleValue) && (
            <Form.Item label="Venue (optional)" name="venueId">
              <Select
                allowClear
                showSearch
                loading={venuesLoading}
                placeholder="Map user to a venue"
                options={venueOptions}
                optionFilterProp="label"
              />
            </Form.Item>
          )}
        </Form>
      </Drawer>
    </>
  );
}