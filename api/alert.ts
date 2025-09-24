import api from "./base";

// Lấy danh sách alert
export async function getAlerts({
    limit = 10,
    page = 1,
    //   title = "",
    //   status = ""
}: {
    limit?: number;
    page?: number;
    //   title?: string;
    //   status?: string;
}) {
    //   const titleSearch = title ? { title } : {};
    //   const statusSearch = status ? { status } : {};
    const res = await api.get("/security-alerts", {
        params: {
            limit,
            page,
            //   ...titleSearch,
            //   ...statusSearch,
        },
    });
    return res.data;
}

// Lấy chi tiết alert theo id
export async function getAlertById(id: string) {
    const res = await api.get(`/security-alerts/${id}`);
    return res.data;
}

// Tạo alert mới
export async function createAlert({
    title,
    description,
    severity,
    status,
    category,
    detected_at,
    data
}: {
    title: string;
    description: string;
    severity: string;
    status: string;
    category?: string;
    detected_at?: string;
    data?: any;
}) {
    const res = await api.post("/security-alerts", {
        title,
        description,
        severity,
        status,
        category,
        detected_at,
        data,
    });
    return res.data;
}

// Cập nhật alert
export async function updateAlert(
    id: string,
    {
        title,
        description,
        severity,
        status,

    }: {
        title: string;
        description: string;
        severity: string;
        status: string;

    }
) {
    const res = await api.put(`/security-alerts/${id}`, {
        title,
        description,
        severity,
        status,

    });
    return res.data;
}

// Xóa alert
export async function deleteAlert(id: string) {
    const res = await api.delete(`/security-alerts/${id}`);
    return res.data;
}
