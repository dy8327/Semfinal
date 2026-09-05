function calculatePrepayment() {
    const loanAmount = Number(
        document.getElementById("loanAmount").value.replace(/,/g, "")
    );

    const prepaymentAmount = Number(
        document.getElementById("prepaymentAmount").value.replace(/,/g, "")
    );

    const interestRate = Number(
        document.getElementById("interestRate").value
    );

    const remainingMonths = Number(
        document.getElementById("remainingMonths").value
    );

    const repaymentType =
        document.getElementById("repaymentType").value;

    const prepaymentOption =
        document.getElementById("prepaymentOption").value;

    const feeRate = Number(
        document.getElementById("feeRate").value
    );

    const resultBox = document.getElementById("resultBox");


    if (
        !loanAmount ||
        !interestRate ||
        !remainingMonths ||
        !prepaymentAmount
    ) {
        resultBox.innerHTML = `
            <div class="result-empty">
                필요한 값을 모두 입력해주세요.
            </div>
        `;
        return;
    }


    if (prepaymentAmount >= loanAmount) {
        resultBox.innerHTML = `
            <div class="result-empty">
                미리 갚을 금액은 남은 대출원금보다 작아야 합니다.
            </div>
        `;
        return;
    }


    if (remainingMonths <= 0) {
        resultBox.innerHTML = `
            <div class="result-empty">
                남은 대출기간을 확인해주세요.
            </div>
        `;
        return;
    }


    const monthlyRate = interestRate / 100 / 12;
    const remainingPrincipal =
        loanAmount - prepaymentAmount;


    let beforeMonthlyPayment = 0;
    let afterMonthlyPayment = 0;

    let beforeTotalInterest = 0;
    let afterTotalInterest = 0;

    let reducedMonths = remainingMonths;


    /* =========================
       원리금균등상환
    ========================= */

    if (repaymentType === "equal-payment") {

        beforeMonthlyPayment = calculateEqualPayment(
            loanAmount,
            monthlyRate,
            remainingMonths
        );

        beforeTotalInterest =
            beforeMonthlyPayment * remainingMonths -
            loanAmount;


        // 남은 기간 유지 → 월 납입액 감소
        if (prepaymentOption === "reduce-payment") {

            afterMonthlyPayment = calculateEqualPayment(
                remainingPrincipal,
                monthlyRate,
                remainingMonths
            );

            afterTotalInterest =
                afterMonthlyPayment * remainingMonths -
                remainingPrincipal;

            reducedMonths = remainingMonths;
        }


        // 월 납입액 유지 → 대출기간 단축
        else if (prepaymentOption === "reduce-period") {

            afterMonthlyPayment =
                beforeMonthlyPayment;

            const periodResult =
                calculateReducedPeriodResult(
                    remainingPrincipal,
                    monthlyRate,
                    beforeMonthlyPayment
                );

            reducedMonths =
                periodResult.months;

            afterTotalInterest =
                periodResult.totalInterest;
        }
    }


    /* =========================
       원금균등상환
    ========================= */

    else if (repaymentType === "equal-principal") {

        beforeTotalInterest =
            calculateEqualPrincipalInterest(
                loanAmount,
                monthlyRate,
                remainingMonths
            );

        beforeMonthlyPayment =
            loanAmount / remainingMonths +
            loanAmount * monthlyRate;


        // 기간 유지
        if (prepaymentOption === "reduce-payment") {

            afterTotalInterest =
                calculateEqualPrincipalInterest(
                    remainingPrincipal,
                    monthlyRate,
                    remainingMonths
                );

            afterMonthlyPayment =
                remainingPrincipal / remainingMonths +
                remainingPrincipal * monthlyRate;

            reducedMonths = remainingMonths;
        }


        // 기간 단축
        else {

            const monthlyPrincipal =
                loanAmount / remainingMonths;

            reducedMonths = Math.ceil(
                remainingPrincipal / monthlyPrincipal
            );

            afterMonthlyPayment =
                monthlyPrincipal +
                remainingPrincipal * monthlyRate;

            afterTotalInterest =
                calculateEqualPrincipalInterest(
                    remainingPrincipal,
                    monthlyRate,
                    reducedMonths
                );
        }
    }


    /* =========================
       만기일시상환
    ========================= */

    else if (repaymentType === "bullet") {

        beforeMonthlyPayment =
            loanAmount * monthlyRate;

        beforeTotalInterest =
            loanAmount *
            monthlyRate *
            remainingMonths;


        afterMonthlyPayment =
            remainingPrincipal * monthlyRate;

        afterTotalInterest =
            remainingPrincipal *
            monthlyRate *
            remainingMonths;

        reducedMonths = remainingMonths;
    }


    /* =========================
       최종 결과
    ========================= */

    const savedInterest =
        beforeTotalInterest -
        afterTotalInterest;

    const prepaymentFee =
        prepaymentAmount *
        (feeRate / 100);

    const netSaving =
        savedInterest -
        prepaymentFee;

    const monthlySaving =
        beforeMonthlyPayment -
        afterMonthlyPayment;

    const savedMonths =
        remainingMonths -
        reducedMonths;


    renderResult({
        remainingPrincipal,
        savedInterest,
        prepaymentFee,
        netSaving,
        beforeMonthlyPayment,
        afterMonthlyPayment,
        monthlySaving,
        reducedMonths,
        savedMonths,
        prepaymentOption
    });
}


/* =========================
   원리금균등 월 납입액
========================= */

function calculateEqualPayment(
    principal,
    monthlyRate,
    months
) {
    if (monthlyRate === 0) {
        return principal / months;
    }

    return (
        principal *
        monthlyRate *
        Math.pow(1 + monthlyRate, months)
    ) /
    (
        Math.pow(1 + monthlyRate, months) - 1
    );
}


/* =========================
   원금균등 총 이자
========================= */

function calculateEqualPrincipalInterest(
    principal,
    monthlyRate,
    months
) {
    let balance = principal;

    const monthlyPrincipal =
        principal / months;

    let totalInterest = 0;

    for (let i = 0; i < months; i++) {

        totalInterest +=
            balance * monthlyRate;

        balance -= monthlyPrincipal;
    }

    return totalInterest;
}


/* =========================
   월 납입액 유지 시 기간 계산
========================= */

function calculateReducedPeriodResult(
    principal,
    monthlyRate,
    monthlyPayment
) {
    let balance = principal;
    let months = 0;
    let totalInterest = 0;


    while (
        balance > 0 &&
        months < 1200
    ) {

        const interest =
            balance * monthlyRate;

        const principalPayment =
            monthlyPayment - interest;


        if (principalPayment <= 0) {
            break;
        }


        // 마지막 회차
        if (principalPayment >= balance) {

            totalInterest += interest;

            balance = 0;
            months++;

            break;
        }


        balance -= principalPayment;
        totalInterest += interest;

        months++;
    }


    return {
        months,
        totalInterest
    };
}


/* =========================
   결과 출력
========================= */

function renderResult(result) {
    const resultBox =
        document.getElementById("resultBox");


    const netSavingText =
        result.netSaving >= 0
            ? formatMoney(result.netSaving)
            : "-" +
              formatMoney(
                  Math.abs(result.netSaving)
              );


    resultBox.innerHTML = `
        <h2 class="result-title">
            계산 결과
        </h2>

        <div class="result-main">
            <div class="result-main-label">
                예상 순절감액
            </div>

            <div class="result-main-value">
                ${netSavingText}원
            </div>
             <div class="result-main-desc">
                중도상환수수료를 제외하고
                실제로 줄어드는 예상 비용입니다.
            </div>
        </div>

        <div class="result-list">

            <div class="result-item">
                <span>줄어드는 예상 이자</span>

                <strong>
                    ${formatMoney(result.savedInterest)}원
                </strong>
            </div>

            <div class="result-item">
                <span>중도상환수수료</span>

                <strong>
                    ${formatMoney(result.prepaymentFee)}원
                </strong>
            </div>

            <div class="result-item">
                <span>상환 후 남은 원금</span>

                <strong>
                    ${formatMoney(result.remainingPrincipal)}원
                </strong>
            </div>

            ${
                result.prepaymentOption === "reduce-period"
                ? `
                    <div class="result-item">
                        <span>상환 후 예상 남은 기간</span>

                        <strong>
                            ${result.reducedMonths}개월
                        </strong>
                    </div>

                    <div class="result-item">
                        <span>줄어드는 대출기간</span>

                        <strong>
                            ${result.savedMonths}개월
                        </strong>
                    </div>
                `
                : ""
            }

            <div class="result-item">
                <span>현재 예상 월 납입액</span>

                <strong>
                    ${formatMoney(
                        result.beforeMonthlyPayment
                    )}원
                </strong>
            </div>

            <div class="result-item">
                <span>상환 후 예상 월 납입액</span>

                <strong>
                    ${formatMoney(
                        result.afterMonthlyPayment
                    )}원
                </strong>
            </div>

            <div class="result-item">
                <span>월 납입액 감소</span>

                <strong>
                    ${formatMoney(
                        result.monthlySaving
                    )}원
                </strong>
            </div>
            <div class="result-guide">
                <strong>계산 기준</strong>

                <p>
                    입력한 금리와 남은 기간을 기준으로
                    예상 이자와 월 납입액을 계산합니다.
                </p>

                <p>
                    실제 금융기관의 계산 방식,
                    중도상환수수료 산정 기준에 따라
                    결과가 달라질 수 있습니다.
                </p>
            </div>

        </div>
    `;
}


/* =========================
   숫자 포맷
========================= */

function formatMoney(value) {
    return Math.round(value)
        .toLocaleString("ko-KR");
}


/* =========================
   금액 자동 쉼표 + 한글 표시
========================= */

const moneyInputs = [
    {
        inputId: "loanAmount",
        koreanId: "loanAmountKorean"
    },
    {
        inputId: "prepaymentAmount",
        koreanId: "prepaymentAmountKorean"
    }
];


moneyInputs.forEach(item => {

    const input =
        document.getElementById(item.inputId);

    const korean =
        document.getElementById(item.koreanId);


    input.addEventListener(
        "input",
        function () {

            const rawValue =
                this.value.replace(
                    /[^0-9]/g,
                    ""
                );


            if (rawValue === "") {

                this.value = "";
                korean.textContent = "";

                return;
            }


            const number =
                Number(rawValue);


            this.value =
                number.toLocaleString("ko-KR");


            korean.textContent =
                formatKoreanMoney(number);
        }
    );


    if (input.value.trim() === "") {
        korean.textContent = "";
    }
});


/* =========================
   한글 금액 표시
========================= */

function formatKoreanMoney(number) {

    if (!number || number <= 0) {
        return "";
    }


    const eok =
        Math.floor(
            number / 100000000
        );

    const man =
        Math.floor(
            (number % 100000000) /
            10000
        );

    const won =
        number % 10000;


    let result = "";


    if (eok > 0) {

        result +=
            `${eok.toLocaleString("ko-KR")}억`;
    }


    if (man > 0) {

        if (result) {
            result += " ";
        }

        result +=
            `${man.toLocaleString("ko-KR")}만원`;
    }


    if (won > 0) {

        if (result) {
            result += " ";
        }

        result +=
            `${won.toLocaleString("ko-KR")}원`;
    }


    return result;
}

document
    .getElementById("calculateButton")
    .addEventListener("click", calculatePrepayment);