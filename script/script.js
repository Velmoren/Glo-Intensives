document.addEventListener('DOMContentLoaded', () => {
	'use strict';

	// выбираем элементы HTML страницы
	const customer = document.getElementById('customer')
	const freelancer = document.getElementById('freelancer')
	const blockCustomer = document.getElementById('block-customer')
	const blockFreelance = document.getElementById('block-freelancer')
	const blockChoice = document.getElementById('block-choice')
	const btnExit = document.getElementById('btn-exit')
	const formCustomer = document.getElementById('form-customer')
	const ordersTable = document.getElementById('orders')
	const modalOrder = document.getElementById('order_read')
	const modalOrderActive = document.getElementById('order_active')
	// const modalClose = document.querySelector('.close');


	const orders = JSON.parse(localStorage.getItem('freeOrders')) || []
	console.log('orders: ', orders)

	// описываем функции 
	const toStorage = () => {
		localStorage.setItem('freeOrders', JSON.stringify(orders))
	}

	const calcDeadline = (deadline) => {
		const deadlineArray = deadline.match(/(\d{4})-(\d{2})-(\d{2})/)
		// вычисляем количество миллисекунд до дедлана по временной зоне UTC 
		const deadLineTime = Date.UTC(deadlineArray[1], deadlineArray[2] - 1, deadlineArray[3])
		// вычисляем количество миллисекунд до текущей даты по временной зоне UTC 
		const dateNow = Date.now()
		// находим разность и переводим её в дни
		var dayNumber = Math.ceil((deadLineTime - dateNow) / (1000 * 60 * 60 * 24))
		// функция склонения падежей
		const num2str = (n, textForms) => {
			n = Math.abs(n) % 100;
			var n1 = n % 10;

			if (n > 10 && n < 20) { return textForms[2]; }
			if (n1 > 1 && n1 < 5) { return textForms[1]; }
			if (n1 == 1) { return textForms[0]; }
			return textForms[2];
		}
		const textForms = ['день', 'дня', 'дней']
		const textForm = num2str(dayNumber, textForms)
		const day = `${dayNumber} ${textForm}`
		// console.log('До выполнения этого заказа осталось  ', day);
		return day
	}

	// рендеринг строк таблицы со всеми заказами 
	const renderOrders = () => {
		ordersTable.textContent = ''
		orders.forEach((order, i) => {

			ordersTable.innerHTML += `
                <tr class="order ${order.active ? 'taken' : ''}" 
                  data-number-order="${i}">
                  <td>${i + 1}</td>
                  <td>${order.title}</td>
                  <td class="${order.currency}"></td>
                  <td>${order.deadline}. Осталось: ${calcDeadline(order.deadline)}</td>
                </tr>
      `
		})
	}

	// обработчик кликов в модальных окнах
	const handlerModal = (event) => {
		const target = event.target // элемент, по которуму кликнули
		const modal = target.closest('.order-modal') // вся модалка
		const order = orders[modal.id] // текущий заказ 

		// создаем функцию, чтобы избежать дублирование кода
		const baseAction = () => {
			modal.style.display = 'none'
			toStorage() // запись заказов в localStorage
			renderOrders() // обновление таблицы заказов
		}
		// закрываем модальное окно
		if (target.closest('.close') || target === modal) {
			modal.style.display = 'none'
		}

		// подтверждаем выбор заказа
		if (target.classList.contains('get-order')) {
			order.active = true
			baseAction()
		}
		// отказываемся от подтверждения выбора заказа
		if (target.id === 'capitulation') {
			order.active = false
			baseAction()
		}
		// удаляем заказ 
		if (target.id === 'ready') {
			orders.splice(orders.indexOf(order), 1)
			baseAction()
		}
	}


	// модальные окна
	const openModal = (numberOrder) => {
		// console.log('numberOrder: ', numberOrder);
		const order = orders[numberOrder]

		// Извлекаем всю информацию из заказа воспользовавшись его декомпозицией
		const { title, firstName, email, description, deadline, currency, amount, phone, active = false } = order
		console.log('deadline: ', deadline);

		// в зависимости от стадии  обработки заказа
		// открываем свое модальное окно 
		const modal = active ? modalOrderActive : modalOrder

		// всю информацию о заказе, которая есть в модальном окне, сохраняем в переменные
		const firstNameBlock = modal.querySelector('.firstName')
		const titleBlock = modal.querySelector('.modal-title')
		const emailBlock = modal.querySelector('.email')
		const descriptionBlock = modal.querySelector('.description')
		const deadlineBlock = modal.querySelector('.deadline')
		const currencyBlock = modal.querySelector('.currency_img')
		const countBlock = modal.querySelector('.count')
		const phoneBlock = modal.querySelector('.phone')

		modal.id = numberOrder
		titleBlock.textContent = title;
		firstNameBlock.textContent = firstName;
		emailBlock.textContent = email;
		// emailBlock.setAttribute('href', `mailto: ${email}`);
		emailBlock.href = `mailto: ${email}`
		descriptionBlock.textContent = description
		deadlineBlock.textContent = calcDeadline(deadline)
		currencyBlock.className = 'currency_img'
		currencyBlock.classList.add(currency)
		countBlock.textContent = amount
		phoneBlock ? phoneBlock.textContent = phone : ''
		phoneBlock ? phoneBlock.href = `tel: ${phone}` : ''

		modal.style.display = "flex"

		// обработчик событий, произошедших внутри модального окна
		modal.addEventListener('click', handlerModal)
	}

	// назначаем обработчик клика по выбранному заказу: открытие модального окна
	ordersTable.addEventListener('click', (event) => {
		const target = event.target
		const targetOrder = target.closest('.order')
		if (targetOrder) {
			openModal(targetOrder.dataset.numberOrder)
		}
	})

	// назначаем обработчики клика по кнопкам 
	customer.addEventListener('click', () => {
		blockChoice.style.display = 'none'
		blockCustomer.style.display = 'block'
		btnExit.style.display = ' block'
	})
	freelancer.addEventListener('click', () => {
		blockChoice.style.display = 'none'
		renderOrders()
		blockFreelance.style.display = 'block'
		btnExit.style.display = ' block'
	})
	btnExit.addEventListener('click', () => {
		btnExit.style.display = 'none'
		blockFreelance.style.display = 'none'
		blockCustomer.style.display = 'none'
		blockChoice.style.display = 'block'
	})

	formCustomer.addEventListener('submit', () => {
		event.preventDefault()

		// первый вариант фильтрации (без ипользования метода filter() )
		// const obj = {}
		// for (const elem of formCustomer.elements) {
		//   if ((elem.tagName === 'INPUT' && elem.type !== 'radio') ||
		//     (elem.type === 'radio' && elem.checked) || elem.tagName === 'TEXTAREA') {

		//     obj[elem.name] = elem.value

		//   }
		//   if (elem.type !== 'radio') {
		//     elem.value = ''
		//   }
		// }
		// orders.push(obj)

		// второй вариант: оператор spread, фильтрация с ипользованием метода filter(), ресет формы 

		const fieldsFilter = (elem) => {
			const rez = (elem.tagName === 'INPUT' && elem.type !== 'radio')
				|| (elem.type === 'radio' && elem.checked)
				|| (elem.tagName === 'TEXTAREA')
			return rez
		}
		const formElements = [...formCustomer.elements].filter(fieldsFilter)

		const obj = {}
		formElements.forEach(elem => obj[elem.name] = elem.value);

		formCustomer.reset() // очистка формы

		orders.push(obj) // добавляем новый заказ

		// запись заказов в localStorage
		toStorage()


	})


}) // end DOMContentLoaded