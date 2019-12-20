document.addEventListener('DOMContentLoaded', ()=>{
    'use strict';
    const customer = document.getElementById('customer');
    const freelancer = document.getElementById('freelancer');
    const blockCustomer = document.getElementById('block-customer');
    const blockFreelancer = document.getElementById('block-freelancer');
    const blockChoice = document.getElementById('block-choice');
    const btnExit = document.getElementById('btn-exit');
    const formCustomer = document.getElementById('form-customer');
    const ordersTable = document.getElementById('orders');
    const ordersTableFooter = document.getElementById('footTable');
    const modalOrder = document.getElementById('order_read');
    const modalOrderActive = document.getElementById('order_active');
    const headTable = document.getElementById('headTable');
    
    const orders = JSON.parse(localStorage.getItem('freeOrders')) || [];

    const toStorage=()=>{
        localStorage.setItem('freeOrders',JSON.stringify(orders));
    };
    
    const dayWord=(day,words)=>{
        return words[day%10==1 && day%100!=11 ? 0 : day%10>=2 && day%10<=4 && (day%100<10 || day%100>=20) ? 1 : 2];
    };
    
    
    const declOfNum = (number, titles) => number + ' ' + titles[(number % 100 > 4 && number % 100 < 20) ? 2 : [2, 0, 1, 1, 1, 2][(number % 10 < 5) ? number % 10 : 5]];

    const calcDeadline=(data)=>{
        const deadline = new Date(data);
        const toDay=Date.now();
        
        const remaining = (deadline-toDay)/1000/60/60;
        
         if (remaining / 24 > 2) {
            return declOfNum(Math.floor(remaining / 24), ['день', 'дня', 'дней']);
        }
        return declOfNum(Math.floor(remaining), ['час', 'часа', 'часов']);
        
       /* const days = Math.floor(Math.abs((Date.parse(deadline)-Date.now())/ (1000 * 3600 * 24)));
        return days+' '+dayWord(days,['день','дня','дней']);*/
};
    
    const renderOrders=()=>{
        ordersTable.textContent='';
        ordersTableFooter.textContent='';
        orders.forEach((order,i)=>{
         ordersTable.innerHTML+=`
    <tr class="order ${order.active ? 'taken':''}" data-number-order="${i}">
        <td>${i+1}</td>
        <td>${order.title}</td>
        <td>${order.amount}</td>
        <td class="${order.currency}"></td>
        <td>${calcDeadline(order.deadline)}</td>
    </tr>`;
        });//строки
        const orderTaken = ordersTable.getElementsByClassName('order taken').length;
        ordersTableFooter.innerHTML=`
<tr><td colspan="5">Всего заказов: ${orders.length}, Свободных заказов: ${orders.length-orderTaken}</td><tr>
`;
        
    };

    
    const handlerModal= (event)=>{
        const target = event.target;
        const modal = target.closest('.order-modal');
        const order = orders[modal.id];
        
        const baseAction=()=>{
            modal.style.display='none';
            toStorage();
            renderOrders();
        }
        
        if(target.closest('.close') || target===modal){
            modal.style.display='none';
        }
        if(target.classList.contains('get-order')){
            order.active=true;
           baseAction();
        }
        if(target.id==='capitulation'){
            order.active=false;
            baseAction();
        }
        if(target.id==='ready'){
            orders.splice(orders.indexOf(order),1);
            baseAction();
        }
    }
    
    const openModal=(numberOrder)=>{
        const order=orders[numberOrder];
        
        const{ title, firstName, email, phone, description, amount, currency, deadline, active = false } = order;
        
        const modal = active? modalOrderActive:modalOrder;
        
        const titleBlock = modal.querySelector('.modal-title');
        const firstNameBlock = modal.querySelector('.firstName');
        const emailBlock = modal.querySelector('.email');
        const descriptionBlock = modal.querySelector('.description');
        const deadlineBlock = modal.querySelector('.deadline');
    
        const currencyBlock = modal.querySelector('.currency_img');
        const countBlock = modal.querySelector('.count');
        const phoneBlock = modal.querySelector('.phone');
        const closeBtn=modal.querySelector('.close');
        modal.id=numberOrder;
        
        titleBlock.textContent = title;
        firstNameBlock.textContent = firstName;
        emailBlock.textContent = email;
        emailBlock.href='mailto:'+email;
        descriptionBlock.textContent = description;
        deadlineBlock.textContent = deadline+'('+calcDeadline(deadline)+')';
        currencyBlock.classList.add(currency);
        countBlock.textContent = amount;
        phoneBlock ? phoneBlock.href = 'tel:'+phone:'';
        
        modal.style.display = 'flex';
        
        modal.addEventListener('click', handlerModal);
        
        closeBtn.addEventListener('click',()=>{
            modal.style.display = 'none';
            currencyBlock.classList.remove(order.currency);
        });
        
    };//openModal
    
    const sortOrder = (arr, property) => {
        arr.sort((a, b) => a[property] > b[property] ? 1 : -1)
    }

    headTable.addEventListener('click', (event) => {
       
        headTable.querySelector('.orderSign')?headTable.querySelector('.orderSign').classList.remove('orderSign'):'';
    
        const target = event.target;
        console.log(target);
        if (target.classList.contains('head-sort')) {
            if (target.id === 'taskSort') {
                target.classList.add('orderSign');
                sortOrder(orders, 'title');
            }
            if (target.id === 'currencySort') {
                sortOrder(orders, 'currency');
                target.classList.add('orderSign');
            }
            if (target.id === 'deadlineSort') {
                sortOrder(orders, 'deadline');
                target.classList.add('orderSign');
            }
            if (target.id === 'costSort') {
                sortOrder(orders, 'amount');
                target.classList.add('orderSign');
            }
            toStorage();
            renderOrders();
        }
    });
    
    ordersTable.addEventListener('click',(event)=>{
        const target = event.target;
        const targerOrder = target.closest('.order');
        
        if(targerOrder){
            openModal(targerOrder.dataset.numberOrder);
        }
        
    });

    customer.addEventListener('click',()=>{
        blockChoice.style.display='none';
        const toDay = new Date().toISOString().substring(0, 10);
        document.getElementById('deadline').min = toDay;
        blockCustomer.style.display='block';
        btnExit.style.display='block';
});
    freelancer.addEventListener('click',()=>{
        blockChoice.style.display='none';
        headTable.querySelector('.orderSign')?headTable.querySelector('.orderSign').classList.remove('orderSign'):'';
        renderOrders();
        blockFreelancer.style.display='block';
        btnExit.style.display='block';
});
    btnExit.addEventListener('click',()=>{
       blockFreelancer.style.display='none';
        blockCustomer.style.display='none';
      btnExit.style.display='none';
       blockChoice.style.display='block';
  });  
   
    formCustomer.addEventListener('submit',(event)=>{
        event.preventDefault();
        const obj={};
        
       const elements = [...formCustomer.elements]
       .filter((elem)=>((elem.tagName==='INPUT' && elem.type!=='radio') ||
              (elem.type==='radio' && elem.checked)||
              (elem.tagName==='TEXTAREA')));
        
       elements.forEach((elem)=>{
            obj[elem.name]=elem.value;
       });
        
        
      /*    for(const elem of formCustomer.elements){
            if((elem.tagName==='INPUT' && elem.type!=='radio') ||
              (elem.type==='radio' && elem.checked)||
              (elem.tagName==='TEXTAREA')){
                obj[elem.name]=elem.value;
            }
            if(elem.type!=='radio'){
                elem.value='';
            }
        }*/
        formCustomer.reset();
        orders.push(obj);
        toStorage();
    });
});