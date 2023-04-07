/**
 * @jest-environment jsdom
 */

import { screen } from "@testing-library/dom"
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"


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
    test("Then the page should contain a form for creating a new bill", () => {
      const html = NewBillUI()
      document.body.innerHTML = html
      const onNavigate = jest.fn()
      const store = {}
      const localStorage = window.localStorage
      const newBill = new NewBill({ document, onNavigate, store, localStorage })
      const form = document.querySelector('[data-testid="form-new-bill"]')
      expect(form).toBeTruthy()
    })
  })
})

// describe("NewBill", () => {
//   test("should have a handleChangeFile method", () => {
//     const newBill = new NewBill({
//       document: document,
//       onNavigate: jest.fn(),
//       store: {},
//       localStorage: window.localStorage
//     });
//     expect(newBill.handleChangeFile).toBeDefined();
//     expect(typeof newBill.handleChangeFile).toBe("function");
//   });
// });




