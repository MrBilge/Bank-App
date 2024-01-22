"use strict";

const account1 = {
  owner: "Jonas Schmedtmann",
  movements: [200, 450, -400, 3000, -650, -130, 70, 1300],
  interestRate: 1.2,
  pin: 1111,
  movementsDates: [
    "2019-11-18T21:31:17.178Z",
    "2019-12-23T07:42:02.383Z",
    "2020-01-28T09:15:04.904Z",
    "2020-04-01T10:17:24.185Z",
    "2020-05-08T14:11:59.604Z",
    "2020-06-29T17:01:17.194Z",
    "2020-07-28T23:36:17.929Z",
    "2023-12-12T10:51:36.790Z",
  ],
  currency: "EUR",
  locale: "pt-PT",
};

const account2 = {
  owner: "Jessica Davis",
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,
  movementsDates: [
    "2019-11-01T13:15:33.035Z",
    "2019-11-30T09:48:16.867Z",
    "2019-12-25T06:04:23.907Z",
    "2020-01-25T14:18:46.235Z",
    "2020-02-05T16:33:06.386Z",
    "2020-06-29T14:43:26.374Z",
    "2020-07-28T18:49:59.371Z",
    "2020-08-01T12:01:20.894Z",
  ],
  currency: "USD",
  locale: "en-US",
};

// uygulamada hesap3 ve 4e  1ve 2 ye ekledigimiz özelikleri eklemedigimiz icin onların hesaplarına giris yapılınca hareketler gözükmüyor cunku islemler  o özellikler ile ilgili olduklarından dolayı özelliği barındırmayan hesaplarda bos gözükür  ekleyince  diger hesaplar gibi  gözüktü****

const account3 = {
  owner: "Steven Thomas Williams",
  movements: [200, -200, 340, -300, -20, 50, 400, -460],
  interestRate: 0.7,
  pin: 3333,
};

const account4 = {
  owner: "Sarah Smith",
  movements: [430, 1000, 700, 50, 90],
  interestRate: 1,
  pin: 4444,
};

const accounts = [account1, account2, account3, account4];

// Elements
const labelWelcome = document.querySelector(".welcome");
const labelDate = document.querySelector(".date");
const labelBalance = document.querySelector(".balance__value");
const labelSumIn = document.querySelector(".summary__value--in");
const labelSumOut = document.querySelector(".summary__value--out");
const labelSumInterest = document.querySelector(".summary__value--interest");
const labelTimer = document.querySelector(".timer");

const containerApp = document.querySelector(".app");
const containerMovements = document.querySelector(".movements");

const btnLogin = document.querySelector(".login__btn");
const btnTransfer = document.querySelector(".form__btn--transfer");
const btnLoan = document.querySelector(".form__btn--loan");
const btnClose = document.querySelector(".form__btn--close");
const btnSort = document.querySelector(".btn--sort");

const inputLoginUsername = document.querySelector(".login__input--user");
const inputLoginPin = document.querySelector(".login__input--pin");
const inputTransferTo = document.querySelector(".form__input--to");
const inputTransferAmount = document.querySelector(".form__input--amount");
const inputLoanAmount = document.querySelector(".form__input--loan-amount");
const inputCloseUsername = document.querySelector(".form__input--user");
const inputClosePin = document.querySelector(".form__input--pin");

// Parayı Özellestirme
const formatCur = function (value, locale, currency) {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currency,
  }).format(value);
};

//  tarihleri özelleştirme
const formatDate = function (date, locale) {
  const calcPassedDay = (date1, date2) =>
    Math.round(Math.abs((date2 - date1) / (1000 * 60 * 60 * 24))); // gün üzerinden farkını ögrenmek icin 24 e kadar yazıyoruz

  const passedDay = calcPassedDay(new Date(), date);
  console.log(passedDay);

  if (passedDay === 0) return "Today";
  if (passedDay === 1) return "Yesterday";
  if (passedDay <= 7) return `${passedDay} days ago`;

  return new Intl.DateTimeFormat(locale).format(date); // uluslararasıTarih API'si ni kullanıyoruz. Kullanıcının kullandıgı ülkeye göre tarih düzenleniyor
};

const displayMovements = function (acc, sort = false) {
  containerMovements.innerHTML = ""; //  daha önceden ekli olan ögeleri kaldırmak icin yapılır.  bulundugu divin tanımlı oldugu degiskenin iceriği  bos olsun

  const movs = sort
    ? acc.movements.slice().sort((a, b) => a - b)
    : acc.movements; // burada parametreleri ayarlayacak, düzene sokacak bir kosul yaptık

  movs.forEach(function (move, index) {
    const type = move < 0 ? "withdrawal" : "deposit";

    const date = new Date(acc.movementsDates[index]);
    const displayDate = formatDate(date, acc.locale); //   ilk argüman aralarındaki farka göre isimlendiriyor today yesterday gibi ikinci argüman ise fark 7 den coksa  local olarak tarihi yazdırıyor.

    // hareketleri  UluslararasıAPi ile düzenliyoruz para birimini

    // ikinci argümana  bir degisken yerine 2. argümanı obje olarak da girebiliriz. option={style:... } olarak ayarladıgımız degiskeni girmek yerine burada yazıyoruz daha pratik.

    //  const formattedmov=    new Intl.NumberFormat(acc.locale, {
    //     style: "currency",
    //     currency: acc.currency,
    //   }).format(move);

    // yukarıdaki kodu bir fonksiyona olusturduk kendini tekrar etmeme ilkesi icin
    const formattedmov = formatCur(move, acc.locale, acc.currency);

    const html = `<div class="movements__row">
    <div class="movements__type movements__type--${type}">${
      index + 1
    } ${type}</div>
    <div class="movements__date">${displayDate}</div>
   <div class="movements__value">${formattedmov} </div>
  </div>`;

    containerMovements.insertAdjacentHTML("afterbegin", html);
  });
};

const calcDisplayBalance = function (acc) {
  acc.balance = acc.movements.reduce((acc, mov) => acc + mov, 0);

  labelBalance.textContent = formatCur(acc.balance, acc.locale, acc.currency);
};

const calcdisplaySummary = function (acc) {
  const income = acc.movements
    .filter((val) => val > 0)
    .reduce((acc, val) => acc + val, 0);
  labelSumIn.textContent = formatCur(income, acc.locale, acc.currency);

  const out = acc.movements
    .filter((val) => val < 0)
    .reduce((acc, val) => acc + val, 0);
  labelSumOut.textContent = formatCur(out, acc.locale, acc.currency);
  const interest = acc.movements
    .filter((val) => val > 0)
    .map((deposit) => (deposit * 1.2) / 100)
    // eger banka faiz kurallarını degistirse 1in üstüne yaparsa napacagız ?  tekrardan filtreleme yapıcaz
    .filter((val) => val >= 1)
    .reduce((acc, val) => acc + val, 0);

  labelSumInterest.textContent = formatCur(interest, acc.locale, acc.currency); // fonksiyonu cagırdıgımız da argümanların neler oldugunu iyi görmemiz gerekiyor bu fonksiyonun icinde tanımlı seyler.
};

// username olustur
const createUserNames = function (accs) {
  // yan etkiler olusturmak icin dizi icerisine for each kullanıyoruz amacımız bir dizi elamanlarını dönerek yeni bir özellik eklemek , manipüle etmek
  accs.forEach(function (acc) {
    acc.username = acc.owner // accaount ögeleri nesnelerine usarneme özelligi ekliyoruz. value kısmını ise  map() ile objede onceden tanımlanmıs değerin üstünde uygulamalar yaparak  yeni bir dizi olusturuyoruz onuda string ifadeye ceviriyoruz join('')ile.
      .toLowerCase()
      .split(" ")
      .map((name) => name[0])
      .join("");
  });
};
createUserNames(accounts); // fonksiyonu cagırınca account icindeki  elemanlara yani objeleri degistirmis oluyoruz iclerine username özelligi ekleniyor
console.log(accounts);

const updateUI = function (acc) {
  // display movements
  displayMovements(acc);

  // display balance
  calcDisplayBalance(acc);

  // display Summary
  calcdisplaySummary(acc);
};

const startLogOutTimer = function () {
  // Set time to 5 minutes
  let time = 300;

  // tick icindeki komutları bilerek tick fonksiyonu olusturarak yazdık cunku time sayacı başta farklı değer gözüktükten sonra isleme geciyordu onu düzeltmek icin bir fonksiyon icerisine aldık  *******

  const tick = function () {
    //    dakikayı  tanımlarken islemi yuvarlıyoruz  iki haneli olması icin padStart kullanıyoruz
    const min = String(Math.floor(time / 60)).padStart(2, 0);
    // saniye sürekli azalacagı icin kendim şöyle kodladım islemi remainder kalan operatörü ile yapıyoruz.
    const second = String(time % 60).padStart(2, 0);

    // In each , print the remaining time to UI
    labelTimer.textContent = `${min}:${second}`;

    // When 0 seconds stop timer and log out user
    if (time === 0) {
      clearInterval(timer);

      containerApp.style.opacity = 0;
      labelWelcome.textContent = "Log in to get started";
    }
    // Decrese 1s
    time--;
  };

  // Call the timer every second
  tick();
  const timer = setInterval(tick, 1000);
  return timer;
};

let currentAccout, timer;

//  giris butonuna tıkladıgımızda
btnLogin.addEventListener("click", function (e) {
  e.preventDefault(); // sayfa yenilenmesin diye yapılır

  // find methodu da bir kosul . özellikle bir inputa hesap bilgileri girildiginde o bilgiye ait olan hesap datasına erisim sağlıyor
  currentAccout = accounts.find(
    //currentAccount  , acc'e esit olacak--        eger hesaplardan birinin username'i  girilen input ile aynı ise o hesabı bul currentAcconta aktar
    (acc) => acc.username === inputLoginUsername.value
  );
  console.log(currentAccout); //  giriş yapıldıktan sonra konsolda cıkıyor ilgili  data

  if (currentAccout?.pin === Number(inputLoginPin.value)) {
    // Numbera cevirmemiz gerek cünkü her zaman string deger alır defaultda

    labelWelcome.textContent = `Welcome back ${
      currentAccout.owner.split(" ")[1]
    }`;
    containerApp.style.opacity = 100;
  }

  // remove username and pin
  removeUserİnfo();
  // her giriş yapıldıgında güncel olan hareketler görüntülensin
  updateUI(currentAccout);
});
const removeUserİnfo = function () {
  inputLoginUsername.value = inputLoginPin.value = "";
  inputLoginPin.blur();

  if (timer) clearInterval(timer); // eger hali hazırda bir timer  zamanlayıcı  varsa  silinsin  sayacların birbirileriyle karısmaması icin
  timer = startLogOutTimer();
};

btnTransfer.addEventListener("click", function (e) {
  // tıklayınca sayfa yenilemesini engellemek icin. Formlarla calısırken bunu yapmak cok yaygındır.
  e.preventDefault();

  const amount = Number(inputTransferAmount.value); // girilen inputlar string deger alır o yuzden her zaman numbera cevirilir****

  //accounts dizisindeki bir hesabı bulmaya çalışıyor;  inputtransfere girilen isim hesaplardaki username ile uyusuyorsa o hesabı bulur ve receiverAcce aktarır
  const receiverAcc = accounts.find(
    (acc) => acc.username === inputTransferTo.value
  );

  // transfer gerceklesmesi icin
  if (
    amount > 0 &&
    receiverAcc && // receiverAcc degiskenin varlıgını kontrol eder  eğer varsa  demek
    currentAccout.balance >= amount &&
    receiverAcc?.username !== currentAccout.username
  ) {
    // transfer
    currentAccout.movements.push(-amount);
    receiverAcc.movements.push(amount);

    //  add transfer date
    currentAccout.movementsDates.push(new Date());
    receiverAcc.movementsDates.push(new Date());

    // update Uı
    updateUI(currentAccout);
    inputTransferAmount.value = inputTransferTo.value = "";

    // islem yaptıgımızda sayac sıfırlansın cünkü islem yaparken belki o sıra oturum kapanabilir.
    // Reset timer
    clearInterval(timer);
    timer = startLogOutTimer();
  }
});

btnClose.addEventListener("click", function (e) {
  e.preventDefault();

  if (
    inputCloseUsername.value === currentAccout.username &&
    Number(inputClosePin.value) === currentAccout.pin
  ) {
    //  username ile eslesen hesabın indexini bulur getirir onuda index degiskenine tanımladık. findindexte bir kosuldur icersine if olusturmaya gerek yoktur.
    const index = accounts.findIndex(
      (acc) => acc.username === currentAccout.username
    );
    console.log(index);
    // delete account
    accounts.splice(index, 1); //  splice methodu ile hesabı silecegiz

    //  Hide UI  - icerikler , kullanıcı ara yüzü kapanak opacity ile yapacagız yine
    containerApp.style.opacity = 0;
    inputClosePin.value = inputCloseUsername.value = "";
    // Reset timer
    clearInterval(timer);
    timer = startLogOutTimer();
  }
});

btnLoan.addEventListener("click", function (e) {
  e.preventDefault();
  const amount = Number(inputLoanAmount.value);
  if (
    amount > 0 &&
    currentAccout.movements.some((mov) => mov >= amount * 0.1) // en az bir öge bu kosula uyuyorsa;
  ) {
    // Reset timer
    clearInterval(timer);
    timer = startLogOutTimer();

    setTimeout(() => {
      currentAccout.movements.push(amount);

      currentAccout.movementsDates.push(new Date().toISOString());

      updateUI(currentAccout);

      inputLoanAmount.value = " ";
    }, 2500);
  }
});

// her tıkladıgımızda degişmesini istiyoruz sıralıyken sıralıya sıralıyken sırasıza gecsin tıkladıgımız
let sorted = false;

btnSort.addEventListener("click", function (e) {
  e.preventDefault();
  displayMovements(currentAccout, !sorted); // her tıkladıgımızda olayını elde etmek icin  true gelecek sekilde yazıyoruz parametreye
  sorted = !sorted; // iki farklı durumuda esitlersek tamamdır artık her tıkladıgımızda degisecek
});

// Bankadaki hesapların toplam parası
const overalBalance = accounts
  .map((mov) => mov.movements)
  .flat()
  .reduce((acc, mov) => acc + mov, 0);
console.log(overalBalance);

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// LECTURES

const currencies = new Map([
  ["USD", "United States dollar"],
  ["EUR", "Euro"],
  ["GBP", "Pound sterling"],
]);

const movements = [200, 450, -400, 3000, -650, -130, 70, 1300];
