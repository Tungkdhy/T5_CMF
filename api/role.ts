// import { describe } from "node:test";
import api from "./base";

// Lấy danh sách role
export async function getRoles({
    pageSize = 10,
    pageIndex = 1,
    name = "",
    visible,
}: {
    pageSize?: number;
    pageIndex?: number;
    name?: string;
    visible?: boolean;
}) {
    const visibleCheck = visible !== undefined ? { visible } : {};
    const res = await api.get("/roles-actions", {
        params: {
            pageSize,
            pageIndex,
            //   name,
            //   ...visibleCheck,
        },
    });
    return res.data;
}

// Lấy chi tiết role theo id
export async function getRoleById(id: string) {
    const res = await api.get(`/roles-actions/${id}`);
    return res.data;
}

// Tạo mới role
export async function createRoleAction(data: any) {
    console.log(data);
    
    const res = await api.post("/roles-actions", {
        roleId: data.roleId,
        actionIds: data.actionIds,
        // description: data.display_name,
        // action_ids: data.actionIds,
    });
    return res.data;
}
export async function createRole(data: any) {
    const res = await api.post("/role", {
        code: data.roleName,
        display_name: data.roleName,
        description: data.description,
        // action_ids: data.actionIds,
    });
    return res.data;
}
// Cập nhật role
export async function updateRole(
    idEdit: string,
    data: any

) {
    console.log(data);
    const { id, ...rest } = data
    const res = await api.put(`/roles-actions/${idEdit}`, {
        ...rest,
        actionIds: data.id
    });
    return res.data;
}
export async function updateRoleAction(
    idEdit: string,
    data: any

) {
    console.log(data);
    const { id, ...rest } = data
    const res = await api.put(`/role/${idEdit}`, {
        ...data,
        code:data.display_name
    });
    return res.data;
}
// Xóa role
export async function deleteRole(id: string) {
    const res = await api.delete(`/role/${id}`);
    return res.data;
}
export async function getRole({
    pageSize = 10,
    pageIndex = 1,
    name = "",
    visible,
}: {
    pageSize?: number;
    pageIndex?: number;
    name?: string;
    visible?: boolean;
}) {
    //   const visibleCheck = visible !== undefined ? { visible } : {};
    const res = await api.get("/role");
    return res.data;
}
export async function getRolesAction({
    pageSize = 10,
    pageIndex = 1,
    name = "",
    visible,
}: {
    pageSize?: number;
    pageIndex?: number;
    name?: string;
    visible?: boolean;
}) {
    //   const visibleCheck = visible !== undefined ? { visible } : {};
    const res = await api.get("/action/all");
    return res.data;
}
export async function createAction(data: any) {
    const res = await api.post("/action", {
        "display_name": data.display_name,
        "description": data.description,
        "method": data.method,
        "url": data.url
    });
    return res.data;
}

// Cập nhật action
export async function updateAction(
    id: string,
    data: any
) {
    const res = await api.put(`/action/${id}`, data);
    return res.data;
}

// Xóa action
export async function deleteAction(id: string) {
    const res = await api.delete(`/action/${id}`);
    return res.data;
}
export async function getDetail(id: string) {
    const res = await api.get(`/roles-actions/${id}`);
    return res.data;
}