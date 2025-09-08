import api from "./base";
export async function getParams({
  pageSize = 10,
  pageIndex = 1,
//   searchTerm = "",
//   logTypeId = "",
}: {
  pageSize?: number;
  pageIndex?: number;
//   searchTerm?: string;
//   logTypeId?: string;
}) {
  const filters: Record<string, string> = {};
//   if (searchTerm) filters.name = searchTerm;
//   if (logTypeId) filters.type = logTypeId;

  const res = await api.get("/system-parameters",{
    params: {
      pageSize,
      pageIndex,
    //   ...filters,
    },
  }
  );

  return res.data;
}

// Xóa log theo id
export async function updateParam(
  id: string,
  data: {
    max?: number | null;
    min?: number | null;
    unit?: string | null;
    default_value?: string | null;
  },
param:{
    display_name?: string,
    value?: string,
    description?: string,
    category_type_id?: string
  }
) {
  // Lọc bỏ các trường null hoặc undefined
  const payload: Record<string, any> = {};
  Object.entries(data).forEach(([key, value]) => {
    if (value !== null && value !== undefined) {
      payload[key] = value;
    }
  });

  // Kiểm tra logic chỉ khi có giá trị min và max
  if (
    payload.min !== undefined &&
    payload.max !== undefined &&
    payload.min > payload.max
  ) {
    throw new Error("Giá trị min không được lớn hơn max");
  }

  // Gửi lên API
  const {default_value, ...rest} = payload;
  const res = await api.put(`/category/${id}`, {
    data: data,
    ...param
    // ...rest
  });
  return res.data;
}
