import React, { useCallback, useEffect, useMemo } from "react";
import { useSelector } from "react-redux";
import { Button, Drawer, Form, Input, Select, Space, message } from "antd";
import { createUser } from "../../../api/user";
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

export default function AddUser({ open, onClose, onSuccess }) {
  const accessToken = useSelector((state) => state.user.value.access_token);
  const [msgApi, contextHolder] = message.useMessage();
  const [submitting, setSubmitting] = React.useState(false);
  const [form] = Form.useForm();

  const roleValue = Form.useWatch("role", form);
  const [venuesLoading, setVenuesLoading] = React.useState(false);
  const [venues, setVenues] = React.useState([]);

  useEffect(() => {
    if (!open || !accessToken) return;
    setVenuesLoading(true);
    listVenues(accessToken)
      .then((data) => {
        const arr = asVenuesArray(data).map(normalizeVenue).filter(Boolean);
        setVenues(arr);
      })
      .catch(() => {
        // keep quiet; dropdown can still be optional
      })
      .finally(() => setVenuesLoading(false));
  }, [open, accessToken]);

  const venueOptions = useMemo(() => {
    return venues
      .filter((v) => v?.isActive !== false)
      .map((v) => ({ label: v.name || v._id, value: v._id }));
  }, [venues]);

  const closeDrawer = useCallback(() => {
    form.resetFields();
    onClose?.();
  }, [form, onClose]);

  const handleSubmit = useCallback(async () => {
    if (!accessToken) return;
    setSubmitting(true);
    try {
      const values = await form.validateFields();
      const payload = {
        name: values.name?.trim(),
        email: values.email?.trim(),
        password: values.password,
        role: values.role,
        venueId: values.role === "incharge" ? values.venueId || null : null,
      };

      await createUser(payload, accessToken);
      msgApi.success("User created");
      closeDrawer();
      onSuccess?.();
    } catch (err) {
      if (err?.errorFields) return; // antd form validation
      msgApi.error(
        err?.response?.data?.message ?? err?.message ?? "Failed to create user"
      );
    } finally {
      setSubmitting(false);
    }
  }, [accessToken, closeDrawer, form, msgApi, onSuccess]);

  return (
    <>
      {contextHolder}
      <Drawer
        title="Add User"
        open={open}
        onClose={closeDrawer}
        width={420}
        destroyOnClose={false}
        extra={
          <Space>
            <Button onClick={closeDrawer}>Cancel</Button>
            <Button type="primary" loading={submitting} onClick={handleSubmit}>
              Create
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
            label="Password"
            name="password"
            rules={[
              { required: true, message: "Password is required" },
              { min: 8, message: "Minimum 8 characters" },
            ]}
          >
            <Input.Password placeholder="Min 8 characters" />
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
              ]}
            />
          </Form.Item>

          {roleValue === "incharge" && (
            <Form.Item label="Venue (optional)" name="venueId">
              <Select
                allowClear
                showSearch
                loading={venuesLoading}
                placeholder="Select a venue"
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