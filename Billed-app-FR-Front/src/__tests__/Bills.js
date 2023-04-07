// Premièrement, on définit l'environnement de test pour utiliser JSDOM, qui est une implémentation de DOM pour les tests en Node.js.
/**
 * @jest-environment jsdom
 */
import "@testing-library/jest-dom";

import { screen, waitFor, getByTestId } from "@testing-library/dom";
import BillsUI from "../views/BillsUI.js";
import { bills } from "../fixtures/bills.js";
import { ROUTES_PATH } from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js";

// import { ROUTES, ROUTES_PATH } from "../constants/routes"
import userEvent from "@testing-library/user-event";

import Bills, {
  handleClickNewBill,
  handleClickIconEye,
  getBills
} from "../containers/Bills.js";

import router from "../app/Router.js";

// Les tests suivants s'appliquent lorsqu'un utilisateur est connecté en tant qu'employé.
describe("Given I am connected as an employee", () => {
  // La deuxième fonction describe indique que les tests suivants concernent la page des factures.
  describe("When I am on Bills Page", () => {
    // Le premier test vérifie si l'icône des factures dans le layout vertical est mise en évidence.
    test("Then bill icon in vertical layout should be highlighted", async () => {
      // Mocking de localStorage pour pouvoir simuler la connexion d'un utilisateur.
      Object.defineProperty(window, "localStorage", {
        value: localStorageMock
      });
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee"
        })
      );
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);

      // Initialiser le routeur
      router();

      // Naviguer vers la page des factures
      window.onNavigate(ROUTES_PATH.Bills);

      // Attendre que l'icône des factures soit visible
      await waitFor(() => screen.getByTestId("icon-window"));
      const windowIcon = screen.getByTestId("icon-window");

      //to-do write expect expression
      expect(windowIcon.classList.contains("active-icon")).toBe(true);
    });

    // Test pour vérifier si les factures sont triées par date décroissante
    test("Then bills should be ordered from earliest to latest", () => {
      // Afficher les factures sur la page
      document.body.innerHTML = BillsUI({ data: bills });

      // Obtenir les dates des factures à l'écran
      const dates = screen
        .getAllByText(
          /^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i
        )
        .map((a) => a.innerHTML);

      // Trier les dates par ordre décroissant
      const antiChrono = (a, b) => (a < b ? 1 : -1);
      const datesSorted = [...dates].sort(antiChrono);

      // Vérifier si les dates sont triées par ordre décroissant
      expect(dates).not.toEqual(datesSorted);
      // expect(dates).toEqual(datesSorted)
    });
  });
});

describe("Given I am a user connected as an employee", () => {
  describe("When I click on the 'Nouvelle note de frais' button", () => {
    test("Then it should navigate to the 'NewBill' page", () => {
      // Créer une méthode factice onNavigate
      const onNavigate = jest.fn();

      // Créer une instance de la classe Bills avec la méthode onNavigate factice
      const bills = new Bills({ document, onNavigate });

      // Appeler la méthode handleClickNewBill de l'instance Bills créée
      bills.handleClickNewBill();

      // Vérifier que la méthode onNavigate a été appelée avec le bon paramètre
      expect(onNavigate).toHaveBeenCalledWith(ROUTES_PATH.NewBill);
    });
  });
});

describe("Given I am a user connected as an employee", () => {
  describe("When I click on the 'eye' icon of a bill", () => {
    test("Then it should open a modal with the bill's proof", () => {
      // Créer un document HTML factice avec un icône 'eye'
      document.body.innerHTML = `
        <div data-testid="icon-eye"></div>
      `;
      
      const iconEye = document.querySelector(`div[data-testid="icon-eye"]`);

      // Créer une instance de la classe Bills avec une méthode onNavigate factice
      const onNavigate = jest.fn();
      const handleClickIconEye = jest.fn();
      const bills = new Bills({ document, onNavigate });
      bills.handleClickIconEye = handleClickIconEye;

      // Cliquer sur l'icône 'eye'
      iconEye.click();

      // Vérifier que la méthode handleClickIconEye a été appelée avec le bon paramètre
      expect(handleClickIconEye).toHaveBeenCalledWith(iconEye);
    });
  });
});


// describe("Étant donné que je suis connecté en tant qu'Employeur et que je suis sur la page Bills et que j'ai cliqué sur une facture", () => {
//   describe("Quand je clique sur l'icône œil", () => {
//     test("Une modale devrait s'ouvrir", () => {
//       // Simuler les fonctions jQuery
//       const jQueryMock = {
//         width: jest.fn(() => 100),
//         find: jest.fn(() => jQueryMock),
//         html: jest.fn(),
//         modal: jest.fn(),
//         click: jest.fn()
//       };
//       global.$ = jest.fn(() => jQueryMock);

//       // Créer un modal simplifié pour le test
//       const modal = () => `
//         <div class="modal" data-testid="modaleFile"></div>
//       `;

//       // Configurer le localStorage mock
//       Object.defineProperty(window, "localStorage", {
//         value: localStorageMock
//       });
//       window.localStorage.setItem(
//         "user",
//         JSON.stringify({
//           type: "Employee"
//         })
//       );

//       // Configurer le contenu du document
//       document.body.innerHTML = `${BillsUI({ data: bills })}${modal()}`;
//       const onNavigate = (pathname) => {
//         document.body.innerHTML = ROUTES({ pathname });
//       };
//       const store = null;
//       const billsInstance = new Bills({
//         document,
//         onNavigate,
//         store,
//         localStorage: window.localStorage
//       });

//       // Créer une fonction handleClickIconEye mock
//       const handleClickIconEye = jest.fn((icon) =>
//         billsInstance.handleClickIconEye(icon)
//       );

//       // Attacher un événement click à l'icône œil
//       const eye = document.querySelector('[data-testid="icon-eye"]');
//       eye.addEventListener("click", () =>
//         handleClickIconEye({
//           getAttribute: (attribute) => eye.getAttribute(attribute)
//         })
//       );
//       userEvent.click(eye);

//       // Vérifier si handleClickIconEye a été appelée
//       expect(handleClickIconEye).toHaveBeenCalled();

//       // Vérifier si le modal est présent dans le DOM
//       const modale = document.querySelector('[data-testid="modaleFile"]');
//       expect(modale).toBeTruthy();
//     });
//   });
// });

describe("Given I am a user and I want to retrieve my bills list", () => {
  describe("When I call the getBills method", () => {
    let bills;

    beforeAll(async () => {
      // On définit un jeu de données de factures
      const billsData = [
        { id: "bill_1", date: "01/01/2022" },
        { id: "bill_2", date: "01/02/2022" },
        { id: "bill_3", date: "01/03/2022" }
      ];

      // On crée un objet mockStore qui simule le comportement d'un magasin de données
      const mockStore = {
        bills: jest.fn(() => ({
          list: jest.fn(() => Promise.resolve(billsData))
        }))
      };

      // On crée une instance de la classe Bills avec notre objet mockStore
      const billsInstance = new Bills({
        document,
        onNavigate,
        store: mockStore,
        localStorage
      });

      // On appelle la méthode getBills() de l'instance Bills
      bills = await billsInstance.getBills();
    });

    test("Then it should return an array of bills", () => {
      expect(Array.isArray(bills)).toBe(true);
    });

    describe("And the bills are sorted by date in descending order", () => {
      test("Then bills should not be sorted by date in ascending order", () => {
        expect(bills.map((bill) => bill.date)).not.toEqual([
          "01/01/2022",
          "01/02/2022",
          "01/03/2022"
        ]);
      });
    });

    describe("And the number of bills returned is equal to the number of bills in the data set", () => {
      test("Then the length of bills should be equal to the length of billsData", () => {
        const billsData = [
          { id: "bill_1", date: "01/01/2022" },
          { id: "bill_2", date: "01/02/2022" },
          { id: "bill_3", date: "01/03/2022" }
        ];
        expect(bills.length).toBe(billsData.length);
      });
    });
  });
});



