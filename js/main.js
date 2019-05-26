/* jshint esversion: 6 */
// budget controller __ data structure
let budgetController = (function() {
  let Expense = function(id, descreption, value) {
    this.id = id;
    this.descreption = descreption;
    this.value = value;
    this.percentage = -1;
  };
  Expense.prototype.calcPercentage = function(totalIncome) {
    if (totalIncome > 0) {
      this.percentage = Math.round((this.value / totalIncome) * 100);
    } else {
      this.percentage = -1;
    }
  };
  Expense.prototype.getPercentage = function() {
    return this.percentage;
  };
  let Income = function(id, descreption, value) {
    this.id = id;
    this.descreption = descreption;
    this.value = value;
  };
  let data = {
    allItems: {
      exp: [],
      inc: []
    },
    totals: {
      exp: 0,
      inc: 0
    },
    budget: 0,
    precentage: -1
  };
  let calculateTotal = function(type) {
    let sum = 0;
    data.allItems[type].forEach(element => {
      sum += element.value;
    });
    data.totals[type] = sum;
  };
  return {
    addItem: function(type, des, val) {
      let newItem, ID;
      if (data.allItems[type].length > 0) {
        ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
      } else {
        ID = 0;
      }
      if (type === "exp") {
        newItem = new Expense(ID, des, val);
      } else if (type === "inc") {
        newItem = new Income(ID, des, val);
      }
      data.allItems[type].push(newItem);
      return newItem;
    },
    deleteItem: function(type, id) {
      let ids, index;
      ids = data.allItems[type].map(curr => curr.id);
      index = ids.indexOf(id);
      if (index !== -1) {
        data.allItems[type].splice(index, 1);
      }
    },
    calculetPercentages: function() {
      data.allItems.exp.forEach(function(cur) {
        cur.calcPercentage(data.totals.inc);
      });
    },
    getPercentages: function() {
      let allPerc = data.allItems.exp.map(cur => cur.getPercentage());
      return allPerc;
    },
    calculateBudget: function() {
      //  calculate total incomes and total expenses
      calculateTotal("inc");
      calculateTotal("exp");
      // calculate the budget: incomes - expenses
      data.budget = data.totals.inc - data.totals.exp;
      // calculate percentage
      if (data.totals.inc > 0) {
        data.precentage = Math.round((data.totals.exp / data.totals.inc) * 100);
      } else {
        data.precentage = -1;
      }
    },
    getbudget: function() {
      return {
        totalExp: data.totals.exp,
        totalInc: data.totals.inc,
        budget: data.budget,
        percentage: data.precentage
      };
    },
    testing: function() {
      return data;
    }
  };
})();
// ui variables and functions
let UIController = (function() {
  let domStrings = {
    inputType: ".add__type",
    inputDescreption: ".add__description",
    inputValue: ".add__value",
    addBtn: ".add__btn",
    incomContainer: ".income__list",
    expensesContainer: ".expenses__list",
    budgetLabel: ".budget__value",
    incomesLabel: ".budget__income--value",
    expensesLabel: ".budget__expenses--value",
    persentageLabel: ".budget__expenses--percentage",
    container: ".container",
    expPercLabel: ".item__percentage",
    dateLabel: ".budget__title--month"
  };
  let formatNum = function(num, type) {
    let splitedNum, int, dec;
    num = Math.abs(num);
    num = num.toFixed(2);
    splitedNum = num.split(".");
    int = splitedNum[0];
    if (int.length > 3) {
      int = int.substr(0, int.length - 3) + "," + int.substr(int.length - 3, 3);
    }
    dec = splitedNum[1];
    return (type === "exp" ? "-" : "+") + int + "." + dec;
  };
  return {
    getInput: function() {
      return {
        type: document.querySelector(domStrings.inputType).value,
        descreption: document.querySelector(domStrings.inputDescreption).value,
        value: parseFloat(document.querySelector(domStrings.inputValue).value)
      };
    },
    getInputStrings: function() {
      return {
        DOM: domStrings
      };
    },
    addListItem: function(obj, type) {
      let html, element;
      if (type === "exp") {
        element = domStrings.expensesContainer;
        html = `<div class="item clearfix" id="exp-${obj.id}">
        <div class="item__description">${obj.descreption}</div>
        <div class="right clearfix">
            <div class="item__value">${obj.value}</div>
            <div class="item__percentage">21%</div>
            <div class="item__delete">
                <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>
            </div>
        </div>
    </div>`;
      } else if (type === "inc") {
        element = domStrings.incomContainer;
        html = `<div class="item clearfix" id="inc-${obj.id}">
        <div class="item__description">${obj.descreption}</div>
        <div class="right clearfix">
            <div class="item__value">${formatNum(obj.value, type)}</div>
            <div class="item__delete">
                <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>
            </div>
        </div>
    </div>`;
      }
      document.querySelector(element).insertAdjacentHTML("beforeend", html);
    },
    deleteListItem: function(idSelector) {
      let item = document.getElementById(idSelector);
      item.parentNode.removeChild(item);
    },
    clearFields: function() {
      let feilds, fieldsArr;
      feilds = document.querySelectorAll(
        domStrings.inputDescreption + ", " + domStrings.inputValue
      );
      fieldsArr = Array.prototype.slice.call(feilds);
      fieldsArr.forEach(element => {
        element.value = "";
      });
      fieldsArr[0].focus();
    },
    displayBudget: function(obj) {
      let type;
      obj.budget > 0 ? (type = "inc") : (type = "exp");
      document.querySelector(domStrings.budgetLabel).textContent = formatNum(
        obj.budget,
        type
      );
      document.querySelector(domStrings.incomesLabel).textContent = formatNum(
        obj.totalInc,
        "inc"
      );
      document.querySelector(domStrings.expensesLabel).textContent = formatNum(
        obj.totalExp,
        "exp"
      );
      if (obj.percentage > 0) {
        document.querySelector(domStrings.persentageLabel).textContent =
          obj.percentage + "%";
      } else {
        document.querySelector(domStrings.persentageLabel).textContent = "---";
      }
    },
    displayPercentages: function(percs) {
      let expPerc;
      expPerc = document.querySelectorAll(domStrings.expPercLabel);
      for (let i = 0; i < expPerc.length; i++) {
        if (percs[i] > 0) {
          expPerc[i].textContent = percs[i] + "%";
        } else {
          expPerc[i].textContent = "---";
        }
      }
      // let nodeListForEach = function(list, callback) {
      //   for (let index = 0; index < list.length; index++) {
      //     callback(list[index], index);
      //   }
      // };
      // nodeListForEach(expPerc, function(cur, index) {
      //   if (percs[index] > 0) {
      //     cur.textContent = percs[index] + "%";
      //   } else {
      //     cur.textContent = "---";
      //   }
      // });
    },
    displayDate: function() {
      let now, year, month, months;
      now = new Date();
      year = now.getFullYear();
      month = now.getMonth();
      months = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec"
      ];
      document.querySelector(domStrings.dateLabel).textContent =
        months[month] + " " + year;
    },
    changeColors: function() {
      let feilds;
      feilds = document
        .querySelectorAll(
          domStrings.inputType +
            ", " +
            domStrings.inputDescreption +
            ", " +
            domStrings.inputValue
        )
        .forEach(function(el) {
          el.classList.toggle("red-focus");
        });
      document.querySelector(domStrings.addBtn).classList.toggle("red");
    }
  };
})();
// the main controller function that controll the budget and the ui to make things work
let controller = (function(budgetCtrl, UICtrl) {
  let DOM = UICtrl.getInputStrings().DOM;
  let setupEventListeners = function() {
    document.querySelector(DOM.addBtn).addEventListener("click", ctrlAddItem);
    document.addEventListener("keypress", function(e) {
      if (e.keyCode === 13) {
        ctrlAddItem();
      }
    });
    document
      .querySelector(DOM.container)
      .addEventListener("click", ctrlDeleteItem);
    document
      .querySelector(DOM.inputType)
      .addEventListener("change", UICtrl.changeColors);
  };
  let updateBudget = function() {
    // calculate the budget and add percentage
    budgetCtrl.calculateBudget();
    // get the budget info to can deal it with the ui
    let budget = budgetCtrl.getbudget();
    // change the budget ui
    UIController.displayBudget(budget);
  };
  var updatePercentage = function() {
    // calculate the percentages
    budgetController.calculetPercentages();
    // read the percentages from the budget controller
    let percentages = budgetController.getPercentages();
    // update the ui with the new percentages
    UICtrl.displayPercentages(percentages);
  };
  // the main function tn the controller function
  let ctrlAddItem = function() {
    let newItem, input;
    input = UICtrl.getInput();
    if (input.descreption !== "" && !isNaN(input.value) && input.value !== 0) {
      newItem = budgetCtrl.addItem(input.type, input.descreption, input.value);
      UIController.addListItem(newItem, input.type);
      UICtrl.clearFields();
      budgetCtrl.calculateBudget(input.type);
      updateBudget();
      updatePercentage();
    }
  };
  let ctrlDeleteItem = function(e) {
    let itemID, IDSplit, ID, type;
    itemID = e.target.parentNode.parentNode.parentNode.parentNode.id;
    if (itemID) {
      IDSplit = itemID.split("-");
      type = IDSplit[0];
      ID = parseInt(IDSplit[1]);
      // delete item from data structure
      budgetCtrl.deleteItem(type, ID);
      // delete item from the ui
      UICtrl.deleteListItem(itemID);
      // update the budget
      updateBudget();
      // update the percentage for each expense
      updatePercentage();
    }
  };
  return {
    init: function() {
      UIController.displayBudget({
        totalExp: 0,
        totalInc: 0,
        budget: 0,
        percentage: 0
      });
      UIController.displayDate();
      setupEventListeners();
    }
  };
})(budgetController, UIController);

controller.init();
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1haW4uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJtYWluLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyoganNoaW50IGVzdmVyc2lvbjogNiAqL1xuLy8gYnVkZ2V0IGNvbnRyb2xsZXIgX18gZGF0YSBzdHJ1Y3R1cmVcbmxldCBidWRnZXRDb250cm9sbGVyID0gKGZ1bmN0aW9uKCkge1xuICBsZXQgRXhwZW5zZSA9IGZ1bmN0aW9uKGlkLCBkZXNjcmVwdGlvbiwgdmFsdWUpIHtcbiAgICB0aGlzLmlkID0gaWQ7XG4gICAgdGhpcy5kZXNjcmVwdGlvbiA9IGRlc2NyZXB0aW9uO1xuICAgIHRoaXMudmFsdWUgPSB2YWx1ZTtcbiAgICB0aGlzLnBlcmNlbnRhZ2UgPSAtMTtcbiAgfTtcbiAgRXhwZW5zZS5wcm90b3R5cGUuY2FsY1BlcmNlbnRhZ2UgPSBmdW5jdGlvbih0b3RhbEluY29tZSkge1xuICAgIGlmICh0b3RhbEluY29tZSA+IDApIHtcbiAgICAgIHRoaXMucGVyY2VudGFnZSA9IE1hdGgucm91bmQoKHRoaXMudmFsdWUgLyB0b3RhbEluY29tZSkgKiAxMDApO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLnBlcmNlbnRhZ2UgPSAtMTtcbiAgICB9XG4gIH07XG4gIEV4cGVuc2UucHJvdG90eXBlLmdldFBlcmNlbnRhZ2UgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy5wZXJjZW50YWdlO1xuICB9O1xuICBsZXQgSW5jb21lID0gZnVuY3Rpb24oaWQsIGRlc2NyZXB0aW9uLCB2YWx1ZSkge1xuICAgIHRoaXMuaWQgPSBpZDtcbiAgICB0aGlzLmRlc2NyZXB0aW9uID0gZGVzY3JlcHRpb247XG4gICAgdGhpcy52YWx1ZSA9IHZhbHVlO1xuICB9O1xuICBsZXQgZGF0YSA9IHtcbiAgICBhbGxJdGVtczoge1xuICAgICAgZXhwOiBbXSxcbiAgICAgIGluYzogW11cbiAgICB9LFxuICAgIHRvdGFsczoge1xuICAgICAgZXhwOiAwLFxuICAgICAgaW5jOiAwXG4gICAgfSxcbiAgICBidWRnZXQ6IDAsXG4gICAgcHJlY2VudGFnZTogLTFcbiAgfTtcbiAgbGV0IGNhbGN1bGF0ZVRvdGFsID0gZnVuY3Rpb24odHlwZSkge1xuICAgIGxldCBzdW0gPSAwO1xuICAgIGRhdGEuYWxsSXRlbXNbdHlwZV0uZm9yRWFjaChlbGVtZW50ID0+IHtcbiAgICAgIHN1bSArPSBlbGVtZW50LnZhbHVlO1xuICAgIH0pO1xuICAgIGRhdGEudG90YWxzW3R5cGVdID0gc3VtO1xuICB9O1xuICByZXR1cm4ge1xuICAgIGFkZEl0ZW06IGZ1bmN0aW9uKHR5cGUsIGRlcywgdmFsKSB7XG4gICAgICBsZXQgbmV3SXRlbSwgSUQ7XG4gICAgICBpZiAoZGF0YS5hbGxJdGVtc1t0eXBlXS5sZW5ndGggPiAwKSB7XG4gICAgICAgIElEID0gZGF0YS5hbGxJdGVtc1t0eXBlXVtkYXRhLmFsbEl0ZW1zW3R5cGVdLmxlbmd0aCAtIDFdLmlkICsgMTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIElEID0gMDtcbiAgICAgIH1cbiAgICAgIGlmICh0eXBlID09PSBcImV4cFwiKSB7XG4gICAgICAgIG5ld0l0ZW0gPSBuZXcgRXhwZW5zZShJRCwgZGVzLCB2YWwpO1xuICAgICAgfSBlbHNlIGlmICh0eXBlID09PSBcImluY1wiKSB7XG4gICAgICAgIG5ld0l0ZW0gPSBuZXcgSW5jb21lKElELCBkZXMsIHZhbCk7XG4gICAgICB9XG4gICAgICBkYXRhLmFsbEl0ZW1zW3R5cGVdLnB1c2gobmV3SXRlbSk7XG4gICAgICByZXR1cm4gbmV3SXRlbTtcbiAgICB9LFxuICAgIGRlbGV0ZUl0ZW06IGZ1bmN0aW9uKHR5cGUsIGlkKSB7XG4gICAgICBsZXQgaWRzLCBpbmRleDtcbiAgICAgIGlkcyA9IGRhdGEuYWxsSXRlbXNbdHlwZV0ubWFwKGN1cnIgPT4gY3Vyci5pZCk7XG4gICAgICBpbmRleCA9IGlkcy5pbmRleE9mKGlkKTtcbiAgICAgIGlmIChpbmRleCAhPT0gLTEpIHtcbiAgICAgICAgZGF0YS5hbGxJdGVtc1t0eXBlXS5zcGxpY2UoaW5kZXgsIDEpO1xuICAgICAgfVxuICAgIH0sXG4gICAgY2FsY3VsZXRQZXJjZW50YWdlczogZnVuY3Rpb24oKSB7XG4gICAgICBkYXRhLmFsbEl0ZW1zLmV4cC5mb3JFYWNoKGZ1bmN0aW9uKGN1cikge1xuICAgICAgICBjdXIuY2FsY1BlcmNlbnRhZ2UoZGF0YS50b3RhbHMuaW5jKTtcbiAgICAgIH0pO1xuICAgIH0sXG4gICAgZ2V0UGVyY2VudGFnZXM6IGZ1bmN0aW9uKCkge1xuICAgICAgbGV0IGFsbFBlcmMgPSBkYXRhLmFsbEl0ZW1zLmV4cC5tYXAoY3VyID0+IGN1ci5nZXRQZXJjZW50YWdlKCkpO1xuICAgICAgcmV0dXJuIGFsbFBlcmM7XG4gICAgfSxcbiAgICBjYWxjdWxhdGVCdWRnZXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgLy8gIGNhbGN1bGF0ZSB0b3RhbCBpbmNvbWVzIGFuZCB0b3RhbCBleHBlbnNlc1xuICAgICAgY2FsY3VsYXRlVG90YWwoXCJpbmNcIik7XG4gICAgICBjYWxjdWxhdGVUb3RhbChcImV4cFwiKTtcbiAgICAgIC8vIGNhbGN1bGF0ZSB0aGUgYnVkZ2V0OiBpbmNvbWVzIC0gZXhwZW5zZXNcbiAgICAgIGRhdGEuYnVkZ2V0ID0gZGF0YS50b3RhbHMuaW5jIC0gZGF0YS50b3RhbHMuZXhwO1xuICAgICAgLy8gY2FsY3VsYXRlIHBlcmNlbnRhZ2VcbiAgICAgIGlmIChkYXRhLnRvdGFscy5pbmMgPiAwKSB7XG4gICAgICAgIGRhdGEucHJlY2VudGFnZSA9IE1hdGgucm91bmQoKGRhdGEudG90YWxzLmV4cCAvIGRhdGEudG90YWxzLmluYykgKiAxMDApO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZGF0YS5wcmVjZW50YWdlID0gLTE7XG4gICAgICB9XG4gICAgfSxcbiAgICBnZXRidWRnZXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgdG90YWxFeHA6IGRhdGEudG90YWxzLmV4cCxcbiAgICAgICAgdG90YWxJbmM6IGRhdGEudG90YWxzLmluYyxcbiAgICAgICAgYnVkZ2V0OiBkYXRhLmJ1ZGdldCxcbiAgICAgICAgcGVyY2VudGFnZTogZGF0YS5wcmVjZW50YWdlXG4gICAgICB9O1xuICAgIH0sXG4gICAgdGVzdGluZzogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gZGF0YTtcbiAgICB9XG4gIH07XG59KSgpO1xuLy8gdWkgdmFyaWFibGVzIGFuZCBmdW5jdGlvbnNcbmxldCBVSUNvbnRyb2xsZXIgPSAoZnVuY3Rpb24oKSB7XG4gIGxldCBkb21TdHJpbmdzID0ge1xuICAgIGlucHV0VHlwZTogXCIuYWRkX190eXBlXCIsXG4gICAgaW5wdXREZXNjcmVwdGlvbjogXCIuYWRkX19kZXNjcmlwdGlvblwiLFxuICAgIGlucHV0VmFsdWU6IFwiLmFkZF9fdmFsdWVcIixcbiAgICBhZGRCdG46IFwiLmFkZF9fYnRuXCIsXG4gICAgaW5jb21Db250YWluZXI6IFwiLmluY29tZV9fbGlzdFwiLFxuICAgIGV4cGVuc2VzQ29udGFpbmVyOiBcIi5leHBlbnNlc19fbGlzdFwiLFxuICAgIGJ1ZGdldExhYmVsOiBcIi5idWRnZXRfX3ZhbHVlXCIsXG4gICAgaW5jb21lc0xhYmVsOiBcIi5idWRnZXRfX2luY29tZS0tdmFsdWVcIixcbiAgICBleHBlbnNlc0xhYmVsOiBcIi5idWRnZXRfX2V4cGVuc2VzLS12YWx1ZVwiLFxuICAgIHBlcnNlbnRhZ2VMYWJlbDogXCIuYnVkZ2V0X19leHBlbnNlcy0tcGVyY2VudGFnZVwiLFxuICAgIGNvbnRhaW5lcjogXCIuY29udGFpbmVyXCIsXG4gICAgZXhwUGVyY0xhYmVsOiBcIi5pdGVtX19wZXJjZW50YWdlXCIsXG4gICAgZGF0ZUxhYmVsOiBcIi5idWRnZXRfX3RpdGxlLS1tb250aFwiXG4gIH07XG4gIGxldCBmb3JtYXROdW0gPSBmdW5jdGlvbihudW0sIHR5cGUpIHtcbiAgICBsZXQgc3BsaXRlZE51bSwgaW50LCBkZWM7XG4gICAgbnVtID0gTWF0aC5hYnMobnVtKTtcbiAgICBudW0gPSBudW0udG9GaXhlZCgyKTtcbiAgICBzcGxpdGVkTnVtID0gbnVtLnNwbGl0KFwiLlwiKTtcbiAgICBpbnQgPSBzcGxpdGVkTnVtWzBdO1xuICAgIGlmIChpbnQubGVuZ3RoID4gMykge1xuICAgICAgaW50ID0gaW50LnN1YnN0cigwLCBpbnQubGVuZ3RoIC0gMykgKyBcIixcIiArIGludC5zdWJzdHIoaW50Lmxlbmd0aCAtIDMsIDMpO1xuICAgIH1cbiAgICBkZWMgPSBzcGxpdGVkTnVtWzFdO1xuICAgIHJldHVybiAodHlwZSA9PT0gXCJleHBcIiA/IFwiLVwiIDogXCIrXCIpICsgaW50ICsgXCIuXCIgKyBkZWM7XG4gIH07XG4gIHJldHVybiB7XG4gICAgZ2V0SW5wdXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgdHlwZTogZG9jdW1lbnQucXVlcnlTZWxlY3Rvcihkb21TdHJpbmdzLmlucHV0VHlwZSkudmFsdWUsXG4gICAgICAgIGRlc2NyZXB0aW9uOiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGRvbVN0cmluZ3MuaW5wdXREZXNjcmVwdGlvbikudmFsdWUsXG4gICAgICAgIHZhbHVlOiBwYXJzZUZsb2F0KGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoZG9tU3RyaW5ncy5pbnB1dFZhbHVlKS52YWx1ZSlcbiAgICAgIH07XG4gICAgfSxcbiAgICBnZXRJbnB1dFN0cmluZ3M6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgRE9NOiBkb21TdHJpbmdzXG4gICAgICB9O1xuICAgIH0sXG4gICAgYWRkTGlzdEl0ZW06IGZ1bmN0aW9uKG9iaiwgdHlwZSkge1xuICAgICAgbGV0IGh0bWwsIGVsZW1lbnQ7XG4gICAgICBpZiAodHlwZSA9PT0gXCJleHBcIikge1xuICAgICAgICBlbGVtZW50ID0gZG9tU3RyaW5ncy5leHBlbnNlc0NvbnRhaW5lcjtcbiAgICAgICAgaHRtbCA9IGA8ZGl2IGNsYXNzPVwiaXRlbSBjbGVhcmZpeFwiIGlkPVwiZXhwLSR7b2JqLmlkfVwiPlxuICAgICAgICA8ZGl2IGNsYXNzPVwiaXRlbV9fZGVzY3JpcHRpb25cIj4ke29iai5kZXNjcmVwdGlvbn08L2Rpdj5cbiAgICAgICAgPGRpdiBjbGFzcz1cInJpZ2h0IGNsZWFyZml4XCI+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVwiaXRlbV9fdmFsdWVcIj4ke29iai52YWx1ZX08L2Rpdj5cbiAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJpdGVtX19wZXJjZW50YWdlXCI+MjElPC9kaXY+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVwiaXRlbV9fZGVsZXRlXCI+XG4gICAgICAgICAgICAgICAgPGJ1dHRvbiBjbGFzcz1cIml0ZW1fX2RlbGV0ZS0tYnRuXCI+PGkgY2xhc3M9XCJpb24taW9zLWNsb3NlLW91dGxpbmVcIj48L2k+PC9idXR0b24+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgPC9kaXY+XG4gICAgPC9kaXY+YDtcbiAgICAgIH0gZWxzZSBpZiAodHlwZSA9PT0gXCJpbmNcIikge1xuICAgICAgICBlbGVtZW50ID0gZG9tU3RyaW5ncy5pbmNvbUNvbnRhaW5lcjtcbiAgICAgICAgaHRtbCA9IGA8ZGl2IGNsYXNzPVwiaXRlbSBjbGVhcmZpeFwiIGlkPVwiaW5jLSR7b2JqLmlkfVwiPlxuICAgICAgICA8ZGl2IGNsYXNzPVwiaXRlbV9fZGVzY3JpcHRpb25cIj4ke29iai5kZXNjcmVwdGlvbn08L2Rpdj5cbiAgICAgICAgPGRpdiBjbGFzcz1cInJpZ2h0IGNsZWFyZml4XCI+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVwiaXRlbV9fdmFsdWVcIj4ke2Zvcm1hdE51bShvYmoudmFsdWUsIHR5cGUpfTwvZGl2PlxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cIml0ZW1fX2RlbGV0ZVwiPlxuICAgICAgICAgICAgICAgIDxidXR0b24gY2xhc3M9XCJpdGVtX19kZWxldGUtLWJ0blwiPjxpIGNsYXNzPVwiaW9uLWlvcy1jbG9zZS1vdXRsaW5lXCI+PC9pPjwvYnV0dG9uPlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgIDwvZGl2PlxuICAgIDwvZGl2PmA7XG4gICAgICB9XG4gICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGVsZW1lbnQpLmluc2VydEFkamFjZW50SFRNTChcImJlZm9yZWVuZFwiLCBodG1sKTtcbiAgICB9LFxuICAgIGRlbGV0ZUxpc3RJdGVtOiBmdW5jdGlvbihpZFNlbGVjdG9yKSB7XG4gICAgICBsZXQgaXRlbSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGlkU2VsZWN0b3IpO1xuICAgICAgaXRlbS5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKGl0ZW0pO1xuICAgIH0sXG4gICAgY2xlYXJGaWVsZHM6IGZ1bmN0aW9uKCkge1xuICAgICAgbGV0IGZlaWxkcywgZmllbGRzQXJyO1xuICAgICAgZmVpbGRzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChcbiAgICAgICAgZG9tU3RyaW5ncy5pbnB1dERlc2NyZXB0aW9uICsgXCIsIFwiICsgZG9tU3RyaW5ncy5pbnB1dFZhbHVlXG4gICAgICApO1xuICAgICAgZmllbGRzQXJyID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoZmVpbGRzKTtcbiAgICAgIGZpZWxkc0Fyci5mb3JFYWNoKGVsZW1lbnQgPT4ge1xuICAgICAgICBlbGVtZW50LnZhbHVlID0gXCJcIjtcbiAgICAgIH0pO1xuICAgICAgZmllbGRzQXJyWzBdLmZvY3VzKCk7XG4gICAgfSxcbiAgICBkaXNwbGF5QnVkZ2V0OiBmdW5jdGlvbihvYmopIHtcbiAgICAgIGxldCB0eXBlO1xuICAgICAgb2JqLmJ1ZGdldCA+IDAgPyAodHlwZSA9IFwiaW5jXCIpIDogKHR5cGUgPSBcImV4cFwiKTtcbiAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoZG9tU3RyaW5ncy5idWRnZXRMYWJlbCkudGV4dENvbnRlbnQgPSBmb3JtYXROdW0oXG4gICAgICAgIG9iai5idWRnZXQsXG4gICAgICAgIHR5cGVcbiAgICAgICk7XG4gICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGRvbVN0cmluZ3MuaW5jb21lc0xhYmVsKS50ZXh0Q29udGVudCA9IGZvcm1hdE51bShcbiAgICAgICAgb2JqLnRvdGFsSW5jLFxuICAgICAgICBcImluY1wiXG4gICAgICApO1xuICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3Rvcihkb21TdHJpbmdzLmV4cGVuc2VzTGFiZWwpLnRleHRDb250ZW50ID0gZm9ybWF0TnVtKFxuICAgICAgICBvYmoudG90YWxFeHAsXG4gICAgICAgIFwiZXhwXCJcbiAgICAgICk7XG4gICAgICBpZiAob2JqLnBlcmNlbnRhZ2UgPiAwKSB7XG4gICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoZG9tU3RyaW5ncy5wZXJzZW50YWdlTGFiZWwpLnRleHRDb250ZW50ID1cbiAgICAgICAgICBvYmoucGVyY2VudGFnZSArIFwiJVwiO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3Rvcihkb21TdHJpbmdzLnBlcnNlbnRhZ2VMYWJlbCkudGV4dENvbnRlbnQgPSBcIi0tLVwiO1xuICAgICAgfVxuICAgIH0sXG4gICAgZGlzcGxheVBlcmNlbnRhZ2VzOiBmdW5jdGlvbihwZXJjcykge1xuICAgICAgbGV0IGV4cFBlcmM7XG4gICAgICBleHBQZXJjID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChkb21TdHJpbmdzLmV4cFBlcmNMYWJlbCk7XG4gICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGV4cFBlcmMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgaWYgKHBlcmNzW2ldID4gMCkge1xuICAgICAgICAgIGV4cFBlcmNbaV0udGV4dENvbnRlbnQgPSBwZXJjc1tpXSArIFwiJVwiO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGV4cFBlcmNbaV0udGV4dENvbnRlbnQgPSBcIi0tLVwiO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICAvLyBsZXQgbm9kZUxpc3RGb3JFYWNoID0gZnVuY3Rpb24obGlzdCwgY2FsbGJhY2spIHtcbiAgICAgIC8vICAgZm9yIChsZXQgaW5kZXggPSAwOyBpbmRleCA8IGxpc3QubGVuZ3RoOyBpbmRleCsrKSB7XG4gICAgICAvLyAgICAgY2FsbGJhY2sobGlzdFtpbmRleF0sIGluZGV4KTtcbiAgICAgIC8vICAgfVxuICAgICAgLy8gfTtcbiAgICAgIC8vIG5vZGVMaXN0Rm9yRWFjaChleHBQZXJjLCBmdW5jdGlvbihjdXIsIGluZGV4KSB7XG4gICAgICAvLyAgIGlmIChwZXJjc1tpbmRleF0gPiAwKSB7XG4gICAgICAvLyAgICAgY3VyLnRleHRDb250ZW50ID0gcGVyY3NbaW5kZXhdICsgXCIlXCI7XG4gICAgICAvLyAgIH0gZWxzZSB7XG4gICAgICAvLyAgICAgY3VyLnRleHRDb250ZW50ID0gXCItLS1cIjtcbiAgICAgIC8vICAgfVxuICAgICAgLy8gfSk7XG4gICAgfSxcbiAgICBkaXNwbGF5RGF0ZTogZnVuY3Rpb24oKSB7XG4gICAgICBsZXQgbm93LCB5ZWFyLCBtb250aCwgbW9udGhzO1xuICAgICAgbm93ID0gbmV3IERhdGUoKTtcbiAgICAgIHllYXIgPSBub3cuZ2V0RnVsbFllYXIoKTtcbiAgICAgIG1vbnRoID0gbm93LmdldE1vbnRoKCk7XG4gICAgICBtb250aHMgPSBbXG4gICAgICAgIFwiSmFuXCIsXG4gICAgICAgIFwiRmViXCIsXG4gICAgICAgIFwiTWFyXCIsXG4gICAgICAgIFwiQXByXCIsXG4gICAgICAgIFwiTWF5XCIsXG4gICAgICAgIFwiSnVuXCIsXG4gICAgICAgIFwiSnVsXCIsXG4gICAgICAgIFwiQXVnXCIsXG4gICAgICAgIFwiU2VwXCIsXG4gICAgICAgIFwiT2N0XCIsXG4gICAgICAgIFwiTm92XCIsXG4gICAgICAgIFwiRGVjXCJcbiAgICAgIF07XG4gICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGRvbVN0cmluZ3MuZGF0ZUxhYmVsKS50ZXh0Q29udGVudCA9XG4gICAgICAgIG1vbnRoc1ttb250aF0gKyBcIiBcIiArIHllYXI7XG4gICAgfSxcbiAgICBjaGFuZ2VDb2xvcnM6IGZ1bmN0aW9uKCkge1xuICAgICAgbGV0IGZlaWxkcztcbiAgICAgIGZlaWxkcyA9IGRvY3VtZW50XG4gICAgICAgIC5xdWVyeVNlbGVjdG9yQWxsKFxuICAgICAgICAgIGRvbVN0cmluZ3MuaW5wdXRUeXBlICtcbiAgICAgICAgICAgIFwiLCBcIiArXG4gICAgICAgICAgICBkb21TdHJpbmdzLmlucHV0RGVzY3JlcHRpb24gK1xuICAgICAgICAgICAgXCIsIFwiICtcbiAgICAgICAgICAgIGRvbVN0cmluZ3MuaW5wdXRWYWx1ZVxuICAgICAgICApXG4gICAgICAgIC5mb3JFYWNoKGZ1bmN0aW9uKGVsKSB7XG4gICAgICAgICAgZWwuY2xhc3NMaXN0LnRvZ2dsZShcInJlZC1mb2N1c1wiKTtcbiAgICAgICAgfSk7XG4gICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGRvbVN0cmluZ3MuYWRkQnRuKS5jbGFzc0xpc3QudG9nZ2xlKFwicmVkXCIpO1xuICAgIH1cbiAgfTtcbn0pKCk7XG4vLyB0aGUgbWFpbiBjb250cm9sbGVyIGZ1bmN0aW9uIHRoYXQgY29udHJvbGwgdGhlIGJ1ZGdldCBhbmQgdGhlIHVpIHRvIG1ha2UgdGhpbmdzIHdvcmtcbmxldCBjb250cm9sbGVyID0gKGZ1bmN0aW9uKGJ1ZGdldEN0cmwsIFVJQ3RybCkge1xuICBsZXQgRE9NID0gVUlDdHJsLmdldElucHV0U3RyaW5ncygpLkRPTTtcbiAgbGV0IHNldHVwRXZlbnRMaXN0ZW5lcnMgPSBmdW5jdGlvbigpIHtcbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKERPTS5hZGRCdG4pLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBjdHJsQWRkSXRlbSk7XG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcImtleXByZXNzXCIsIGZ1bmN0aW9uKGUpIHtcbiAgICAgIGlmIChlLmtleUNvZGUgPT09IDEzKSB7XG4gICAgICAgIGN0cmxBZGRJdGVtKCk7XG4gICAgICB9XG4gICAgfSk7XG4gICAgZG9jdW1lbnRcbiAgICAgIC5xdWVyeVNlbGVjdG9yKERPTS5jb250YWluZXIpXG4gICAgICAuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGN0cmxEZWxldGVJdGVtKTtcbiAgICBkb2N1bWVudFxuICAgICAgLnF1ZXJ5U2VsZWN0b3IoRE9NLmlucHV0VHlwZSlcbiAgICAgIC5hZGRFdmVudExpc3RlbmVyKFwiY2hhbmdlXCIsIFVJQ3RybC5jaGFuZ2VDb2xvcnMpO1xuICB9O1xuICBsZXQgdXBkYXRlQnVkZ2V0ID0gZnVuY3Rpb24oKSB7XG4gICAgLy8gY2FsY3VsYXRlIHRoZSBidWRnZXQgYW5kIGFkZCBwZXJjZW50YWdlXG4gICAgYnVkZ2V0Q3RybC5jYWxjdWxhdGVCdWRnZXQoKTtcbiAgICAvLyBnZXQgdGhlIGJ1ZGdldCBpbmZvIHRvIGNhbiBkZWFsIGl0IHdpdGggdGhlIHVpXG4gICAgbGV0IGJ1ZGdldCA9IGJ1ZGdldEN0cmwuZ2V0YnVkZ2V0KCk7XG4gICAgLy8gY2hhbmdlIHRoZSBidWRnZXQgdWlcbiAgICBVSUNvbnRyb2xsZXIuZGlzcGxheUJ1ZGdldChidWRnZXQpO1xuICB9O1xuICB2YXIgdXBkYXRlUGVyY2VudGFnZSA9IGZ1bmN0aW9uKCkge1xuICAgIC8vIGNhbGN1bGF0ZSB0aGUgcGVyY2VudGFnZXNcbiAgICBidWRnZXRDb250cm9sbGVyLmNhbGN1bGV0UGVyY2VudGFnZXMoKTtcbiAgICAvLyByZWFkIHRoZSBwZXJjZW50YWdlcyBmcm9tIHRoZSBidWRnZXQgY29udHJvbGxlclxuICAgIGxldCBwZXJjZW50YWdlcyA9IGJ1ZGdldENvbnRyb2xsZXIuZ2V0UGVyY2VudGFnZXMoKTtcbiAgICAvLyB1cGRhdGUgdGhlIHVpIHdpdGggdGhlIG5ldyBwZXJjZW50YWdlc1xuICAgIFVJQ3RybC5kaXNwbGF5UGVyY2VudGFnZXMocGVyY2VudGFnZXMpO1xuICB9O1xuICAvLyB0aGUgbWFpbiBmdW5jdGlvbiB0biB0aGUgY29udHJvbGxlciBmdW5jdGlvblxuICBsZXQgY3RybEFkZEl0ZW0gPSBmdW5jdGlvbigpIHtcbiAgICBsZXQgbmV3SXRlbSwgaW5wdXQ7XG4gICAgaW5wdXQgPSBVSUN0cmwuZ2V0SW5wdXQoKTtcbiAgICBpZiAoaW5wdXQuZGVzY3JlcHRpb24gIT09IFwiXCIgJiYgIWlzTmFOKGlucHV0LnZhbHVlKSAmJiBpbnB1dC52YWx1ZSAhPT0gMCkge1xuICAgICAgbmV3SXRlbSA9IGJ1ZGdldEN0cmwuYWRkSXRlbShpbnB1dC50eXBlLCBpbnB1dC5kZXNjcmVwdGlvbiwgaW5wdXQudmFsdWUpO1xuICAgICAgVUlDb250cm9sbGVyLmFkZExpc3RJdGVtKG5ld0l0ZW0sIGlucHV0LnR5cGUpO1xuICAgICAgVUlDdHJsLmNsZWFyRmllbGRzKCk7XG4gICAgICBidWRnZXRDdHJsLmNhbGN1bGF0ZUJ1ZGdldChpbnB1dC50eXBlKTtcbiAgICAgIHVwZGF0ZUJ1ZGdldCgpO1xuICAgICAgdXBkYXRlUGVyY2VudGFnZSgpO1xuICAgIH1cbiAgfTtcbiAgbGV0IGN0cmxEZWxldGVJdGVtID0gZnVuY3Rpb24oZSkge1xuICAgIGxldCBpdGVtSUQsIElEU3BsaXQsIElELCB0eXBlO1xuICAgIGl0ZW1JRCA9IGUudGFyZ2V0LnBhcmVudE5vZGUucGFyZW50Tm9kZS5wYXJlbnROb2RlLnBhcmVudE5vZGUuaWQ7XG4gICAgaWYgKGl0ZW1JRCkge1xuICAgICAgSURTcGxpdCA9IGl0ZW1JRC5zcGxpdChcIi1cIik7XG4gICAgICB0eXBlID0gSURTcGxpdFswXTtcbiAgICAgIElEID0gcGFyc2VJbnQoSURTcGxpdFsxXSk7XG4gICAgICAvLyBkZWxldGUgaXRlbSBmcm9tIGRhdGEgc3RydWN0dXJlXG4gICAgICBidWRnZXRDdHJsLmRlbGV0ZUl0ZW0odHlwZSwgSUQpO1xuICAgICAgLy8gZGVsZXRlIGl0ZW0gZnJvbSB0aGUgdWlcbiAgICAgIFVJQ3RybC5kZWxldGVMaXN0SXRlbShpdGVtSUQpO1xuICAgICAgLy8gdXBkYXRlIHRoZSBidWRnZXRcbiAgICAgIHVwZGF0ZUJ1ZGdldCgpO1xuICAgICAgLy8gdXBkYXRlIHRoZSBwZXJjZW50YWdlIGZvciBlYWNoIGV4cGVuc2VcbiAgICAgIHVwZGF0ZVBlcmNlbnRhZ2UoKTtcbiAgICB9XG4gIH07XG4gIHJldHVybiB7XG4gICAgaW5pdDogZnVuY3Rpb24oKSB7XG4gICAgICBVSUNvbnRyb2xsZXIuZGlzcGxheUJ1ZGdldCh7XG4gICAgICAgIHRvdGFsRXhwOiAwLFxuICAgICAgICB0b3RhbEluYzogMCxcbiAgICAgICAgYnVkZ2V0OiAwLFxuICAgICAgICBwZXJjZW50YWdlOiAwXG4gICAgICB9KTtcbiAgICAgIFVJQ29udHJvbGxlci5kaXNwbGF5RGF0ZSgpO1xuICAgICAgc2V0dXBFdmVudExpc3RlbmVycygpO1xuICAgIH1cbiAgfTtcbn0pKGJ1ZGdldENvbnRyb2xsZXIsIFVJQ29udHJvbGxlcik7XG5cbmNvbnRyb2xsZXIuaW5pdCgpO1xuIl19
