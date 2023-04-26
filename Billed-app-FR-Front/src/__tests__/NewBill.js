/**
 * @jest-environment jsdom
 */

import {fireEvent, screen, waitFor} from '@testing-library/dom';
import userEvent from '@testing-library/user-event';

import {ROUTES, ROUTES_PATH} from '../constants/routes';

import {localStorageMock} from '../__mocks__/localStorage.js';
import mockStore from '../__mocks__/store.js'

import NewBillUI from '../views/NewBillUI.js';

import NewBill from '../containers/NewBill.js';
import router from "../app/Router.js";

jest.mock("../app/store", () => mockStore)


// describe("Given I am connected as an employee", () => {
//   describe("When I am on NewBill Page", () => {
//     // test("Then ...", () => {
//       const html = NewBillUI()
//       document.body.innerHTML = html
//       //to-do write assertion
//     })
//   })

describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {

    test("Then new bill icon in vertical layout should be highlighted", async () => {
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
      window.onNavigate(ROUTES_PATH.NewBill);

      // Attendre que l'icône des factures soit visible
      await waitFor(() => screen.getByTestId("icon-mail"));
      const mailIcon = screen.getByTestId("icon-mail");
      expect(mailIcon.classList.contains("active-icon")).toBe(true);
    })

    describe('When I select a file through the file input', () => {
      document.body.innerHTML = NewBillUI();

      const store = {
        bills: jest.fn(() => {
          return {create: jest.fn(() => Promise.resolve({fileUrl: 'https://localhost:3456/images/test.jpg', key: '1234'}))}
        })
      }

      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({pathname});
      };

      const fileInput = screen.getByTestId("file");
      const container = new NewBill({
        document,
        onNavigate,
        store,
        localStorage: window.localStorage,
      });

      const fileChange = jest.fn(container.handleChangeFile);
      fileInput.addEventListener('change', (e) => {
        fileChange(e);
      });

      describe('If the file is a jpg or png image', () => {
        test("Then the visual cue to indicate the wrong input shouldn't be displayed and the file should be uploaded", () => {
          const file = new File(['hello'], 'hello.png', {type: 'image/png'});
          fileInput.classList.add('is-invalid');
          userEvent.upload(fileInput, file);
          expect(fileChange).toHaveBeenCalled();
          expect(fileInput.files[0]).toStrictEqual(file);
          expect(fileInput.files.item(0)).toStrictEqual(file);
          expect(fileInput.files).toHaveLength(1);
          expect(fileInput.classList.contains('is-invalid')).toBeFalsy();
        });
      });
      describe('If the file is not a jpg or png image', () => {
        test('Then the visual cue to indicate the wrong input should be displayed and the file should not be uploaded', () => {
          const file = new File(['hello'], 'hello.bmp', {type: 'image/bmp'});
          userEvent.upload(fileInput, file);
          expect(fileChange).toHaveBeenCalled();
          expect(fileInput.files[0]).toStrictEqual(file);
          expect(fileInput.files.item(0)).toStrictEqual(file);
          expect(fileInput.files).toHaveLength(1);
          expect(fileInput.classList.contains('is-invalid')).toBeTruthy();
        });
      });
    });
  });
});

describe('Integration test - When I submit the new bill form', () => {
    beforeEach(() => {
        // Simuler la session de l'utilisateur en configurant localStorage
        Object.defineProperty(window, 'localStorage', {value: localStorageMock});
        window.localStorage.setItem(
            'user',
            JSON.stringify({
                type: 'Employee',
                email: 'test@test.com',
            })
        );

        // Créer le DOM pour le test
        const root = document.createElement('div');
        root.setAttribute('id', 'root');
        document.body.append(root);
    });

    test('Then the handleSubmit method should be called', async () => {
        // Initialiser la fonction onNavigate pour la redirection
        const onNavigate = jest.fn();

        // Créer l'interface utilisateur pour la page de création de facture
        const html = NewBillUI();
        document.body.innerHTML = html;

        // Initialiser le composant NewBill avec les fonctions nécessaires pour le test
        const newBill = new NewBill({
            document,
            onNavigate,
            store: mockStore,
            localStorage: window.localStorage,
        });

        // Simuler la soumission du formulaire de création de facture
        const form = screen.getByTestId('form-new-bill');
        const handleSubmitSpy = jest.spyOn(newBill, 'handleSubmit');
        form.addEventListener('submit', handleSubmitSpy);
        userEvent.type(screen.getByTestId('expense-type'), 'Test');
        userEvent.type(screen.getByTestId('expense-name'), 'Test Bill');
        userEvent.type(screen.getByTestId('amount'), '100');
        userEvent.type(screen.getByTestId('datepicker'), '2022-04-21');
        userEvent.type(screen.getByTestId('vat'), '10');
        userEvent.type(screen.getByTestId('pct'), '20');
        userEvent.type(screen.getByTestId('commentary'), 'Test Comment');
        userEvent.upload(screen.getByTestId('file'), new File(['test'], 'test.jpg', {type: 'image/jpeg'}));
        fireEvent.submit(form);

        // Attendre que la fonction handleSubmit soit appelée
        await waitFor(() => expect(handleSubmitSpy).toHaveBeenCalled());

        // Vérifier que l'utilisateur est redirigé vers la page des factures
        expect(onNavigate).toHaveBeenCalledWith(ROUTES_PATH['Bills']);
    });
});













