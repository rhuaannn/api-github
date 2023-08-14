//import {GithubUser} from "./GithubUser";
export class GithubUser {
  static search(username) {
    const endpoint = `https://api.github.com/users/${username}`;

    return fetch(endpoint)
      .then((data) => data.json())
      .then((data) => ({
        login: data.login,
        name: data.name,
        public_repos: data.public_repos,
        followers: data.followers,
      }));
  }
}

export class Favorites {
  constructor(root) {
    this.root = document.querySelector(root);
    this.load();
  }
  load() {
    this.entries = JSON.parse(localStorage.getItem("@github-favorites:")) || [];
  }
  save() {
    localStorage.setItem("@github-favorites:", JSON.stringify(this.entries));
  }
  async add(username) {
    try {
      const userExists = this.entries.find((entry) => entry.login === username);
      if (userExists) {
        throw new Error("Usuário cadastrado!");
      }
      const user = await GithubUser.search(username);
      if (user.login === undefined || user.name === undefined) {
        throw new Error("Usuário não encontrado!");
      }
      this.entries = [user, ...this.entries];
      this.update();
      this.save();
    } catch (error) {
      alert(error.message);
    }
  }
  delete(user) {
    const filterEntries = this.entries.filter(
      (entry) => entry.login !== user.login
    );

    this.entries = filterEntries;
    this.update();
    this.save();
  }
}

export class FavoritesView extends Favorites {
  constructor(root) {
    super(root);
    this.tbody = this.root.querySelector("table tbody");
    this.update();
    this.onadd();
  }
  onadd() {
    const addButton = this.root.querySelector(".search button");
    addButton.onclick = () => {
      const { value } = this.root.querySelector(".search input");
      this.add(value);
      
    };
  }
  update() {
    this.removeAllTr();
    
    this.entries.forEach((user) => {
      const row = this.createRow();
      row.querySelector(
        ".user img"
      ).src = `https://github.com/${user.login}.png`;
      row.querySelector(".user img ").alt = `Imagem de ${user.name}`;
      row.querySelector(".user p").textContent = user.name;
      row.querySelector(".user a").href = `https://github.com/${user.login}`
      row.querySelector(".user span").textContent = user.login;
      row.querySelector(".repositories").textContent = user.public_repos;
      row.querySelector(".followers").textContent = user.followers;

      row.querySelector(".remove").onclick = () => {
        const isConfirm = confirm(
          "Tem certeza que deseja deletar essa linha ?"
        );
        if (isConfirm) {
          this.delete(user);
        }
      };
      this.tbody.append(row);
    });
  }
  createRow() {
    const tr = document.createElement("tr");
    tr.innerHTML = `   
    <td class="user">
      <img
        src="https://github.com/rhuaannn.png"
        alt="imagem do github"
      />
      <a href="">
        <p></p>
        <span></span>
      </a>
    </td>
    <td class="repositories"></td>
    <td class="followers"></td>
    <td>
      <button class="remove">&times;</button>
    </td>
  `;
    return tr;
  }

  removeAllTr() {
    this.tbody.querySelectorAll("tr").forEach((tr) => {
      tr.remove();
    });
  }
}
