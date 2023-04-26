/**
 * @jest-environment jsdom
 */

// import "@testing-library/jest-dom";

import {screen, waitFor} from "@testing-library/dom";
import BillsUI from "../views/BillsUI.js";
import {bills} from "../fixtures/bills.js";
// import { ROUTES_PATH } from "../constants/routes.js";
import {localStorageMock} from "../__mocks__/localStorage.js";
import mockStore from "../__mocks__/store.js";

import "@testing-library/jest-dom";

import {ROUTES, ROUTES_PATH} from "../constants/routes";
import userEvent from "@testing-library/user-event";

import router from "../app/Router.js";
import Bills from "../containers/Bills.js";
import store from "../app/Store.js";

jest.mock("../app/store", () => mockStore);

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
            document.body.innerHTML = BillsUI({data: bills});

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

    describe("When I am on Bills page but it is loading", () => {
        test("Then, Loading page should be rendered", () => {
            document.body.innerHTML = BillsUI({loading: true});
            expect(screen.getAllByText("Loading...")).toBeTruthy();
        });
    });

    describe("When I am on Bills page but back-end send an error message", () => {
        test("Then, Error page should be rendered", () => {
            document.body.innerHTML = BillsUI({error: "some error message"});
            expect(screen.getAllByText("Erreur")).toBeTruthy();
        });
    });

    describe("When I click on new bill button", () => {
        test("Then I should go to the new bill form page", () => {
            const html = BillsUI({data: bills});
            const onNavigate = (pathname) => {
                document.body.innerHTML = ROUTES({pathname});
            };
            document.body.innerHTML = html;
            const container = new Bills({
                document,
                onNavigate,
                store,
                localStorage: window.localStorage
            });

            const formTrigger = jest.fn(container.handleClickNewBill);
            const button = screen.getByTestId("btn-new-bill");

            button.addEventListener("click", formTrigger);

            userEvent.click(button);
            expect(formTrigger).toHaveBeenCalled();
            expect(screen.getByTestId("form-new-bill")).toBeTruthy();
        });
    });

    describe('When I click on eye icon', () => {
        test('Then it should open the bill modal with corresponding content', () => {
            $.fn.modal = jest.fn();
            document.body.innerHTML = BillsUI({data: bills});
            const onNavigate = (pathname) => {
                document.body.innerHTML = ROUTES({pathname});
            };
            const container = new Bills({
                document,
                onNavigate,
                store,
                localStorage: window.localStorage,
            });

            const iconEye = screen.getAllByTestId('icon-eye');
            const eye = iconEye[0];
            userEvent.click(eye);
            const modale = document.getElementById('modaleFile');
            const billUrl = eye.getAttribute('data-bill-url').split('?')[0];
            // const billUrl = eye.getAttribute('data-bill-url');

            // console.log(billUrl)

            expect(modale.innerHTML.includes(billUrl)).toBeTruthy();
            expect(modale).toBeTruthy();
            expect($.fn.modal).toHaveBeenCalled();
        });
    });

    describe("When I click on the 'Nouvelle note de frais' button", () => {
        test("Then it should navigate to the 'NewBill' page", () => {
            // Créer une méthode factice onNavigate
            const onNavigate = jest.fn();

            // Créer une instance de la classe Bills avec la méthode onNavigate factice
            const bills = new Bills({document, onNavigate});

            // Appeler la méthode handleClickNewBill de l'instance Bills créée
            bills.handleClickNewBill();

            // Vérifier que la méthode onNavigate a été appelée avec le bon paramètre
            expect(onNavigate).toHaveBeenCalledWith(ROUTES_PATH.NewBill);
        });
    });
});

// GET BILLS
describe('getBills intégration tests suites', () => {
    // Scénario : lorsque l'application essaie de récupérer les données depuis l'API et que cela réussit
    describe('When the app tries to fetch data from the API and succeeds', () => {
        test('Then it should return an array with the corresponding length', async () => {
            // Spy sur la méthode bills de notre store
            const getSpy = jest.spyOn(mockStore, 'bills');

            // Appel de la méthode list() pour récupérer les factures
            const bills = await mockStore.bills().list();

            // Vérification que la méthode bills() a été appelée une fois
            expect(getSpy).toHaveBeenCalledTimes(1);

            // Vérification que le tableau de factures retourné contient le bon nombre d'éléments
            expect(bills.length).toBe(4)
        });
    });

    // Scénario : lorsque l'application essaie de récupérer les données depuis l'API et que cela échoue
    describe('When the app tries to fetch data from the API and fails', () => {

        // On configure notre environnement pour simuler une requête échouée
        beforeEach(() => {
            jest.spyOn(mockStore, 'bills')
            Object.defineProperty(
                window,
                'localStorage',
                {value: localStorageMock}
            )
            window.localStorage.setItem('user', JSON.stringify({
                type: 'Employee',
                email: "a@a"
            }))
            const root = document.createElement("div")
            root.setAttribute("id", "root")
            document.body.append(root)
            router()
        })

        // Scénario : lorsque l'API retourne un code 404
        test('fetches Bills from an API and fails with 404 message error', async () => {
            // On simule une requête qui échoue avec une erreur 404
            mockStore.bills.mockImplementationOnce(() => {
                return {
                    list: () => {
                        return Promise.reject(new Error("Erreur 404"))
                    }
                }
            })

            // On navigue vers la page des factures
            window.onNavigate(ROUTES_PATH.Bills)
            await new Promise(process.nextTick)

            // On vérifie que le message d'erreur 404 est affiché à l'écran
            const message = await screen.getByText(/Erreur 404/);
            expect(message).toBeTruthy()
        })

        // Scénario : lorsque l'API retourne un code 500
        test('fetches Bills from an API and fails with 500 message error', async () => {
            // On simule une requête qui échoue avec une erreur 500
            mockStore.bills.mockImplementationOnce(() => {
                return {
                    list: () => {
                        return Promise.reject(new Error("Erreur 500"))
                    }
                }
            })

            // On navigue vers la page des factures
            window.onNavigate(ROUTES_PATH.Bills)
            await new Promise(process.nextTick)

            // On vérifie que le message d'erreur 500 est affiché à l'écran
            const message = await screen.getByText(/Erreur 500/);
            expect(message).toBeTruthy()
        })
    })
})






