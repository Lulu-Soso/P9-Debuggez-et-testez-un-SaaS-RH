import { ROUTES_PATH } from '../constants/routes.js'
import { formatDate, formatStatus } from "../app/format.js"
import Logout from "./Logout.js"

export default class Bills {
  // Le constructeur de la classe prend un objet en argument avec les clés suivantes : document, onNavigate, store et localStorage. 
  // Il attache les gestionnaires d'événements aux éléments appropriés de la page.
  constructor({ document, onNavigate, store, localStorage }) {
    this.document = document
    this.onNavigate = onNavigate
    this.store = store
    const buttonNewBill = document.querySelector(`button[data-testid="btn-new-bill"]`)
    if (buttonNewBill) buttonNewBill.addEventListener('click', this.handleClickNewBill)
    const iconEye = document.querySelectorAll(`div[data-testid="icon-eye"]`)
    if (iconEye) iconEye.forEach(icon => {
      icon.addEventListener('click', () => this.handleClickIconEye(icon))
    })
    new Logout({ document, localStorage, onNavigate })
  }

  // La méthode handleClickNewBill navigue vers la page de création d'une nouvelle facture lorsque l'utilisateur clique sur le bouton "Nouvelle facture".
  handleClickNewBill = () => {
    this.onNavigate(ROUTES_PATH['NewBill'])
  }

  // La méthode handleClickIconEye affiche une preuve de facture dans une modale lorsqu'un utilisateur clique sur l'icône "œil" associée à une facture.
  handleClickIconEye = (icon) => {
    const billUrl = icon.getAttribute("data-bill-url")
    const imgWidth = Math.floor($('#modaleFile').width() * 0.5)
    $('#modaleFile').find(".modal-body").html(`<div style='text-align: center;' class="bill-proof-container"><img width=${imgWidth} src=${billUrl} alt="Bill" /></div>`)
    $('#modaleFile').modal('show')
  }

  // La méthode getBills récupère les factures stockées, les formate et les trie par date décroissante.
  getBills = () => {
    if (this.store) {
      return this.store
      .bills()
      .list()
      .then(snapshot => {
        const bills = snapshot
        .map(doc => {
          try {
            return {
              ...doc,
              date: formatDate(doc.date),
              status: formatStatus(doc.status)
              }
            } catch(e) {
              // if for some reason, corrupted data was introduced, we manage here failing formatDate function
              // log the error and return unformatted date in that case
              console.log(e,'for',doc)
              return {
                ...doc,
                date: doc.date,
                status: formatStatus(doc.status)
              }
            }
          })
          .sort((a, b) => new Date(b.date) - new Date(a.date)); // Tri par ordre décroissant de date
          console.log('length', bills.length)
        return bills
      })
    }
  }
}
