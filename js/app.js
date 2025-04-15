document.addEventListener("DOMContentLoaded", () => {
  const guestField = document.getElementById("guest-field");
  const guestPopup = document.getElementById("guest-popup");
  const increaseAdultButton = document.getElementById("increase-adult");
  const decreaseAdultButton = document.getElementById("decrease-adult");
  const addChildButton = document.getElementById("add-child");
  const childList = document.getElementById("child-list");
  const doneButton = document.getElementById("done-button");
  const cancelButton = document.getElementById("cancel_button");
  const adultCountSpan = document.getElementById("adult-count");
  const clearCheckInButton = document.getElementById("cross");
  const datepickerElement = document.getElementById("datepicker");

  let adultCount = 2;
  let dateRange = '';
  let childCount = 0;
  let child = 0;
  let child_2 = 0;

  const DateTime = easepick.DateTime;
  const bookedDates = [
    //     Заполнить из массива
  ].map(d => {
    if (d instanceof Array) {
      const start = new DateTime(d[0], 'YYYY-MM-DD');
      const end = new DateTime(d[1], 'YYYY-MM-DD');

      return [start, end];
    }

    return new DateTime(d, 'YYYY-MM-DD');
  });
  const datePicker = {
    element: datepickerElement,
    css: [
      'https://cdn.jsdelivr.net/npm/@easepick/bundle@1.2.1/dist/index.css',
      'https://easepick.com/css/demo_hotelcal.css',
    ],
    plugins: ['RangePlugin', 'LockPlugin'],
    autoApply: false,
    appendTo: document.body,
    zIndex: 10000,
    locale: {
      cancel: "Отменить",
      apply: "Применить",
    },
    RangePlugin: {
      tooltipNumber(num) {
        return num - 1;
      },
      locale: {
        zero: "Ночь",
        one: "Ночь",
        two: "Ночи",
        few: "Ночи",
        many: "Ночей",
        other: "Ночей"
      },
    },
    behaviour: {
      trigger: null, // ОТКЛЮЧАЕМ автоматическое открытие при фокусе
    },
    LockPlugin: {
      minDate: new Date(),
      minDays: 1,
      inseparable: true,
      filter(date, picked) {
        if (picked.length === 1) {
          const incl = date.isBefore(picked[0]) ? '[)' : '(]';
          return !picked[0].isSame(date, 'day') && date.inArray(bookedDates, incl);
        }

        return date.inArray(bookedDates, '[)');
      },
    },
    setup(picker) {
      const shadowRoot = document.querySelector('.easepick-wrapper').shadowRoot;
      const pickerContainer = shadowRoot.querySelector('.container');

      shadowRoot.addEventListener("click", (e) => {
        if (shadowRoot) {
          const cancelButton = shadowRoot.querySelector(".cancel-button");
          const path = e.composedPath();
          if (cancelButton && path[0].isEqualNode(cancelButton)) {
            e.stopPropagation();
            e.preventDefault();
            picker.hide();
            setTimeout(() => {
              datepickerElement.blur();
              pickerContainer.classList.remove("show");

            }, 0);
          }
        }
      });

      picker.on('select', (event) => {
        event.stopPropagation();
        const {start, end} = event.detail;
        dateRange = {start: start.format('YYYY-MM-DD'), end: end.format('YYYY-MM-DD')};
        setTimeout(() => {
          picker.hide(); // Закрываем вручную
          datepickerElement.blur(); // Убираем фокус
        }, 0);
      });

      picker.on('hide', () => {
        guestField.style.pointerEvents = "auto";
        guestField.classList.remove("guest-hidden");
      })
    },
  }

  const picker = new easepick.create(datePicker);

  const phoneInput = document.getElementById('contact-phone');

  phoneInput.value = '+7';

  phoneInput.addEventListener('focus', () => {
    if (!phoneInput.value.startsWith('+7')) {
      phoneInput.value = '+7';
    }
  });

  phoneInput.addEventListener('input', (e) => {
    if (!phoneInput.value.startsWith('+7')) {
      phoneInput.value = '+7';
    }
  });

  phoneInput.addEventListener('keydown', (e) => {
    if (phoneInput.selectionStart <= 2 && (e.key === 'Backspace' || e.key === 'Delete')) {
      e.preventDefault();
    }
  });

  guestField.addEventListener("mousedown", (e) => {
    e.preventDefault(); // Останавливаем всплытие
  });

  datepickerElement.addEventListener("click", (e) => {
    picker.show();
    guestField.style.pointerEvents = "none";
    guestField.classList.add("guest-hidden");
  });

  clearCheckInButton.addEventListener("click", (event) => {
    event.stopPropagation();
    picker.clear();
    clearCheckInButton.style.display = "none";
  });

  // Открыть/закрыть плашку
  guestField.addEventListener("click", (event) => {
    event.stopPropagation();
    toggleGuestPopup();
  });

  // Закрыть плашку при клике вне её
  document.addEventListener("click", (event) => {
    if (!guestPopup.contains(event.target) && event.target !== guestField) {
      guestPopup.style.display = guestPopup.style.display === 'block' ? 'none' : 'none';
    }
    if (!popupWidget.contains(event.target) && event.target !== submitButton) {
      popupWidget.classList.remove("active");
    }
  });

  // Увеличение количества взрослых
  increaseAdultButton.addEventListener("click", (event) => {
    event.stopPropagation();
    adultCount++;
    adultCountSpan.textContent = adultCount;
  });

  // Уменьшение количества взрослых
  decreaseAdultButton.addEventListener("click", (event) => {
    event.stopPropagation();
    if (adultCount > 1) {
      adultCount--;
      adultCountSpan.textContent = adultCount;
    }
  });

  // Добавить ребёнка
  addChildButton.addEventListener("click", (event) => {
    event.stopPropagation();

    const childCount = childList.children.length + 1;

    const childItem = document.createElement("div");
    childItem.className = "child-item";
    childItem.innerHTML = `
    <span>Ребёнок ${childCount}:</span>
      <select class="child-age">
        <option value="1">1 - 6 лет</option>
        <option value="2">7 - 17 лет</option>
      </select>
      <button class="remove-child">Удалить</button>
    `;

    childList.appendChild(childItem);

    // Обработчик для удаления ребёнка
    childItem.querySelector(".remove-child").addEventListener("click", (e) => {
      e.stopPropagation();
      childList.removeChild(childItem);
      updateChildNumbers();
    });
  });

  // Обновить нумерацию детей
  function updateChildNumbers() {
    Array.from(childList.children).forEach((childItem, index) => {
      childItem.querySelector("span").textContent = `Ребёнок ${index + 1}:`;
    });
  }

  cancelButton.addEventListener("click", (event) => {
    event.stopPropagation();
    toggleGuestPopup();
  })

  // Кнопка "Готово"
  doneButton.addEventListener("click", (event) => {
    event.stopPropagation();
    let childText;
    let adultText;

    const children = Array.from(childList.children).map((childItem) => {
      const ageInput = childItem.querySelector(".child-age");
      const ageArr = ageInput.value.split(","); // Преобразуем строку в массив (зависит от разделителя)
      ageArr.forEach((item) => {
        if (item.trim() === '1') {
          child += 1;
        } else {
          child_2 += 1;
        }
      });
    });

    childCount = child + child_2;
    if (childCount === 1) {
      childText = 'ребенка';
    } else {
      childText = 'детей';
    }

    if (adultCount === 1) {
      adultText = 'взрослого';
      if (childCount === 0) {
        adultText = 'гостя';
      }
    } else {
      adultText = 'взрослых';
      if (childCount === 0) {
        if (adultCount === 1) {
          adultText = 'гостя';
        } else {
          adultText = 'гостей';
        }
      }
    }

    if (adultCount === 1 && childCount === 0) {

    }

    if (child > 0 && child_2 > 0) {
      guestField.textContent = `${adultCount} ${adultText} и ${children.length} ${childText} (${child}: 1-6 лет, ${child_2}: 7-17 лет)`;
    } else if (child > 0 || child_2 > 0) {
      if (child > 0) {
        guestField.textContent = `${adultCount} ${adultText} и ${children.length} ${childText} (${child}: 1-6 лет)`;
      } else {
        guestField.textContent = `${adultCount} ${adultText} и ${children.length} ${childText} (${child_2}: 7-17 лет)`;
      }
    } else {
      guestField.textContent = `${adultCount} ${adultText}`;
    }

    guestPopup.style.display = guestPopup.style.display === 'block' ? 'none' : 'none';
  });


  // Показать/скрыть плашку
  function toggleGuestPopup() {
    guestPopup.style.display = guestPopup.style.display === 'block' ? 'none' : 'block';
  }

  const submitButton = document.getElementById("booking-module_submit_button");
  const popupWidget = document.getElementById("popup_widget");
  const closeButton = document.getElementById("close-popup");

  // Обработчик открытия popup
  submitButton.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (dateRange !== '') { // Проверяем, что dateRange не пустая
      popupWidget.classList.add("active");
      const guestField = document.getElementById("guest-field");
      const {start, end} = dateRange
      document.getElementById("check-in_2").value = start || "Не выбрано";
      document.getElementById("check-out_2").value = end || "Не выбрано";
      document.getElementById("guest-count").value = guestField.textContent || "Не выбрано";
    } else {
      alert("Пожалуйста, выберите даты!");
    }
  });

  closeButton.addEventListener("click", () => {
    popupWidget.classList.remove("active");
  });

  // Обработчик формы
  document.getElementById('submit_form').addEventListener("click", async (e) => {
    e.preventDefault();

    const radioElements = document.getElementsByName('bookingtype');
    let radioValue;
    for (let i = 0; i < radioElements.length; i++) {
      if (radioElements[i].checked) {
        radioValue = radioElements[i].value;
        break;
      }
    }
    const baseUrl = 'https://kazar.the-crew-rzn.ru'
    const codeRequest = await fetch(baseUrl + '/api/v1/secretcode', {
      method: 'GET',
    });
    const codeData = await codeRequest.json();
    const {code, state} = codeData
    const body = {
      code: parseInt(code),
      state: state,
      request_from: 'Web-site',
      name: document.getElementById('contact-name').value,
      email: document.getElementById('contact-email').value,
      phone: document.getElementById('contact-phone').value,
      date_from: document.getElementById('check-in_2').value,
      date_to: document.getElementById('check-out_2').value,
      adults: parseInt(adultCount),
      child1: parseInt(child),
      child2: parseInt(child_2),
      type: radioValue
    };
    await fetch(baseUrl + '/api/v1/booking/create',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      }
    ).then(response => response.json())
      .then(data => console.log(data))
      .catch(error => console.error('Error:', error));
  })
});
