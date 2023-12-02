const getAlbums = async () => {
  try {
    return (await fetch("api/albums/")).json();
  } catch (error) {
    console.log(error);
  }
};

const showAlbums = async () => {
  let albums = await getAlbums();
  let albumsDiv = document.getElementById("album-list");
  albumsDiv.innerHTML = "";
  albums.forEach((album) => {
    const section = document.createElement("section");
    section.classList.add("album");
    albumsDiv.append(section);

    const a = document.createElement("a");
    a.href = "#";
    section.append(a);

    const h3 = document.createElement("h3");
    h3.innerHTML = album.name;
    a.append(h3);

    if (album.img) {
      const img = document.createElement("img");
      img.src = album.img;
      section.append(img);
    }

    a.onclick = (e) => {
      e.preventDefault();
      displayDetails(album);
    };
  });
};

const displayDetails = (album) => {
  const albumDetails = document.getElementById("album-details");
  albumDetails.innerHTML = "";

  const h3 = document.createElement("h3");
  h3.innerHTML = album.name;
  albumDetails.append(h3);

  const dLink = document.createElement("a");
  dLink.innerHTML = "	&#x2715;";
  albumDetails.append(dLink);
  dLink.id = "delete-link";

  const eLink = document.createElement("a");
  eLink.innerHTML = "&#9998;";
  albumDetails.append(eLink);
  eLink.id = "edit-link";

  const p = document.createElement("p");
  albumDetails.append(p);
  p.innerHTML = album.description;

  const ul = document.createElement("ul");
  albumDetails.append(ul);
  console.log(album.artist);
  const li = document.createElement("li");
  ul.append(li);
  li.innerHTML = artist;

  eLink.onclick = (e) => {
    e.preventDefault();
    document.querySelector(".dialog").classList.remove("transparent");
    document.getElementById("modal-background").classList.remove("hidden");
    document.getElementById("add-edit-title").innerHTML = "Edit album";
  };

  dLink.onclick = (e) => {
    e.preventDefault();
    deletealbum(album._id);
  };

  populateEditForm(album);
};

async function deletealbum(_id) {
  let response = await fetch(`/api/albums/${_id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json;charset=utf-8",
    },
  });

  if (response.status != 200) {
    console.log("Error deleting");
    return;
  }

  let result = await response.json();
  showalbums();
  document.getElementById("album-details").innerHTML = "";
  resetForm();
  showalbums();
}

const populateEditForm = (album) => {
  const form = document.getElementById("add-edit-album-form");
  form._id.value = album._id;
  form.name.value = album.name;
  form.description.value = album.description;

  const artistP = document.getElementById("artist-boxes");
  artistP.innerHTML = "";
  console.log(album.artist);

  
  const input = document.createElement("input");
  input.type = "text";
  input.value = album.artist;
  artistP.append(input);
  
};

const addartist = (e) => {
  e.preventDefault();
  const p = document.getElementById("artist-boxes");
  const input = document.createElement("input");
  input.type = "text";
  p.append(input);
};

const addEditalbum = async (e) => {
  e.preventDefault();

  const form = document.getElementById("add-edit-album-form");
  const formData = new FormData(form);
  formData.append("artist", getartist());
  console.log(...formData);
  let response;
  console.log(form._id.value > 0 && form._id.value.length);
  if (form._id.value == -1) {
    formData.delete("_id");
    response = await fetch("/api/albums", {
      method: "POST",
      body: formData,
    });
  } else {
    console.log("editting");
    response = await fetch(`/api/albums/${form._id.value}`, {
      method: "PUT",
      body: formData,
    });
  }

  if (response.status != 200) {
    console.log("ERROR posting data");
    return;
  }

  let result = await response.json();

  if (form._id.value != -1) {
    const album = await getalbum(form._id.value);
    displayDetails(album);
  }

  document.querySelector(".dialog").classList.add("transparent");
  resetForm();
  showalbums();
};

const getalbum = async (_id) => {
  let response = await fetch(`/api/albums/${_id}`);
  if (response.status != 200) {
    console.log("Error reciving album");
    return;
  }

  return await response.json();
};

const getartist = () => {
  const inputs = document.querySelectorAll("#artist-boxes input");
  const artist = "";

  inputs.forEach((input) => {
    artist.push(input.value);
  });
  console.log(artist);
  return artist;
};

const resetForm = () => {
  const form = document.getElementById("add-edit-album-form");
  form.reset();
  form._id = "-1";
  document.getElementById("artist-boxes").innerHTML = "";
};

const showHideAdd = (e) => {
  e.preventDefault();
  document.querySelector(".dialog").classList.remove("transparent");
  document.getElementById("add-edit-title").innerHTML = "Add album";
  resetForm();
};

window.onload = () => {
  showalbums();
  document.getElementById("add-artist").onclick = addartist;
  document.getElementById("add-edit-album-form").onsubmit = addEditalbum;
  document.getElementById("add-link").onclick = showHideAdd;

  document.querySelector(".close").onclick = () => {
    document.querySelector(".dialog").classList.add("transparent");
  };
};