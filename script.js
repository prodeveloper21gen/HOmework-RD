const date = document.querySelector('.date');
const time = document.querySelector('.time');
const box = document.querySelector('.box');
const inpSearch = document.querySelector('.inpSearch');
const btnRD = document.querySelector('.btnRD');
const btnSort = document.querySelector('.btnSort');
const EditDialog = document.querySelector(".EditDialog");
const addForm = document.querySelector(".addForm");
const closeEditDialog = document.querySelector(".closeEditDialog");
const editName = document.querySelector(".editName");
const btnEdit = document.querySelector(".btnEdit");
const Api = 'https://66b99baffa763ff550f8d5e8.mockapi.io/apiBack/todo';
let idx = null;

document.querySelector('.closeEditDialog').onclick = () => {
  EditDialog.close();
};

setInterval(() => {
  date.innerHTML = new Date(Date.now()).toDateString();
}, 1000);

setInterval(() => {
  time.innerHTML = new Date().toLocaleTimeString();
}, 1000);

async function Get(searchWord) {
  try {
    const response = await fetch(
      searchWord ? Api + "?name=" + searchWord : Api
    );
    const data = await response.json();
    if (searchWord && data.length === 0) {
      Post({ name: searchWord, status: false });
    } else {
      getData(data);
    }
  } catch (error) {
    console.error(error);
  }
}

async function Post(obj) {
  try {
    const response = await fetch(Api, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(obj),
    });
    if (!response.ok) throw new Error('Failed to create task');
    Get();
  } catch (error) {
    console.error(error);
  }
}

const EditedTask = async (id, updatedProduct) => {
  try {
    const response = await fetch(`${Api}/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatedProduct),
    }); 
    Get();
  } catch (error) {
    console.error(error);
  }
};

const deleteProduct = async (id) => {
  try {
    const response = await fetch(`${Api}/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete product');
    Get();
  } catch (error) {
    console.error(error);
  }
};

addForm.onsubmit = (event) => {
  event.preventDefault();
  let obj = {
    name: addForm["addName"].value,
    status: false,
  };
  Post(obj);
};

inpSearch.oninput = (event) => {
  Get(event.target.value);
};

const openEditModal = async (id) => {
  const response = await fetch(`${Api}/${id}`);
  const product = await response.json();
  idx = product.id;
  editName.value = product.name;
  EditDialog.showModal();
};

btnEdit.onclick = async (event) => {
  event.preventDefault();
  const updatedProduct = {
    name: editName.value,
  };
  await EditedTask(idx, updatedProduct);
  EditDialog.close();
};

btnSort.onclick = async () => {
  try {
    const response = await fetch(Api);
    let data = await response.json();
    data.sort((a, b) => a.name.localeCompare(b.name));
    getData(data);
  } catch (error) {
    console.error(error);
  }
};

btnRD.onclick = async () => {
  try {
    const response = await fetch(Api);
    let data = await response.json();
    const unDuplicated = data.reduce((acc, curr) => {
      if (!acc.some(item => item.name === curr.name)) acc.push(curr);
      return acc;
    }, []);
    getData(unDuplicated);
  } catch (error) {
    console.error(error);
  }
};

function getData(data) {
  box.innerHTML = "";
  data.forEach((element, i) => {
    const tr = document.createElement("tr");
    const tdIndex = document.createElement("td");
    const tdName = document.createElement("td");
    const name = document.createElement("span");
    const tdActions = document.createElement("td");
    const btnDelete = document.createElement("button");
    const btnEdit = document.createElement("button");
    const btnCapUncap = document.createElement("button");
    tdIndex.innerHTML = i + 1;
    name.innerHTML = element.name;
    if (element.status) {
      name.style.textDecoration = "line-through";
      btnCapUncap.innerHTML = "UNCAP";
    } else {
      btnCapUncap.innerHTML = "CAP";
    }
    btnDelete.innerHTML = "Delete";
    btnEdit.innerHTML = "Edit";
    tdName.classList.add("tdName");
    btnDelete.classList.add('btnDelete')
    btnEdit.classList.add('btnEdit')
    btnCapUncap.classList.add('btnCapUncap')
    btnDelete.onclick = () => deleteProduct(element.id);
    btnEdit.onclick = () => openEditModal(element.id);
    btnCapUncap.onclick = async () => {
      element.status = !element.status;
      await EditedTask(element.id, element);
    };
    tdName.append(name);
    tdActions.append(btnEdit, btnDelete, btnCapUncap);
    tr.append(tdIndex, tdName, tdActions);
    box.appendChild(tr);
  });
}

Get();