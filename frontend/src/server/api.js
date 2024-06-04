const API_URL = "http://localhost:3001/books/";

export const fetchData = async () => {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) {
      throw new Error("Failed to fetch data");
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
};

const API_ACC = "http://localhost:3001/auth/";

export const fetchDataAcc = async () => {
  try {
    const response = await fetch(API_ACC);
    if (!response.ok) {
      throw new Error("Failed to fetch data");
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
};

export const deleteAccount = async (id) => {
  try {
    const response = await fetch(`${API_ACC}${id}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      throw new Error("Failed to delete account");
    }
    console.log("Account deleted successfully");
  } catch (error) {
    console.error("Error deleting room:", error);
    throw error;
  }
};




const API_INS = "http://localhost:3001/instances/";

export const fetchDataIns = async () => {
  try {
    const response = await fetch(API_INS);
    if (!response.ok) {
      throw new Error("Failed to fetch data");
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
};

const API_RO = "http://localhost:3001/rooms/";

export const fetchDataRo = async () => {
  try {
    const response = await fetch(API_RO);
    if (!response.ok) {
      throw new Error("Failed to fetch data");
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
};

export const deleteRoom = async (id) => {
  try {
    const response = await fetch(`${API_RO}${id}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      throw new Error("Failed to delete room");
    }
    console.log("Room deleted successfully");
  } catch (error) {
    console.error("Error deleting room:", error);
    throw error;
  }
};


export const updateRoom = async (id, roomData) => {
  try {
    const response = await fetch(`${API_RO}${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(roomData),
    });
    if (!response.ok) {
      throw new Error("Failed to update room");
    }
    console.log("Room updated successfully");
    return await response.json();
  } catch (error) {
    console.error("Error updating room:", error);
    throw error;
  }
};



export const updateStatus = async (id, newStatus, letter) => {
  try {
    console.log("ID yang akan diupdate:", id);
    console.log("Status baru:", newStatus);
    console.log("Nama file letter yang akan disertakan:", letter);

    const response = await fetch(`${API_URL}/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status: newStatus, copyLetter: letter }), // Include the letter in the request body
    });

    if (!response.ok) {
      throw new Error("Failed to update status");
    }

    const updatedItem = await response.json();
    console.log("Item diperbarui:", updatedItem);
    return updatedItem;

  } catch (error) {
    console.error("Error updating status:", error);
    throw error;
  }
};


export const updateStatusV2 = async (id, newStatus) => {
  try {
    console.log("ID yang akan diupdate:", id);
    console.log("Status baru:", newStatus);
    

    const response = await fetch(`${API_URL}/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status: newStatus }), // Include the letter in the request body
    });

    if (!response.ok) {
      throw new Error("Failed to update status");
    }

    const updatedItem = await response.json();
    console.log("Item diperbarui:", updatedItem);
    return updatedItem;

  } catch (error) {
    console.error("Error updating status:", error);
    throw error;
  }
};


export const deleteData = async (id) => {
  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      throw new Error("Failed to delete data");
    }
    console.log("Data deleted successfully");
  } catch (error) {
    console.error("Error deleting data:", error);
    throw error;
  }
};

export const createData = async (formData) => {
  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });
    if (!response.ok) {
      throw new Error("Failed to create data");
    }
    console.log("Data created successfully");
  } catch (error) {
    console.error("Error creating data:", error);
    throw error;
  }
};

export const updateData = async (id, newData) => {
  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newData),
    });
    if (!response.ok) {
      throw new Error("Failed to update data");
    }
    console.log("Data updated successfully");
  } catch (error) {
    console.error("Error updating data:", error);
    throw error;
  }
};

const API_LOG = "http://localhost:3001/auth/login";
export const login = async (username, password) => {
  const response = await fetch(API_LOG, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username, password }),
  });
  
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Something went wrong');
  }
  
  return data;
};

export const createDataRo = async (formData) => {
  try {
      const response = await fetch("http://localhost:3001/rooms/", {
          method: "POST",
          body: formData
      });
      if (!response.ok) {
          throw new Error("Failed to create data");
      }
      const createdData = await response.json();
      console.log("Data created successfully", createdData);
      return createdData;
  } catch (error) {
      console.error("Error creating data:", error);
      throw error;
  }
};
