function calculateBreakEven() {
    const loanAmount = Number(
        document.getElementById("loanAmount").value.replace(/,/g, "")
    );

    const interestRate = Number(
        document.getElementById("interestRate").value
    );

    const remainingMonths = Number(
        document.getElementById("remainingMonths").value
    );

    const repaymentType =
        document.getElementById("repaymentType").value;

    const prepaymentAmount = Number(
        document.getElementById("prepaymentAmount").value.replace(/,/g, "")
    );

    const feeRate = Number(
        document.getElementById("feeRate").value
    );

    const resultBox =
        document.getElementById("resultBox");


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


    if (prepaymentAmount > loanAmount) {
        resultBox.innerHTML = `
            <div class="result-empty">
                지금 갚을 금액은 남은 대출원금을 초과할 수 없습니다.
            </div>
        `;
        return;
    }


    const monthlyRate =
        interestRate / 100 / 12;

    const remainingPrincipal =
        loanAmount - prepaymentAmount;


    let beforeTotalInterest = 0;
    let afterTotalInterest = 0;

    let beforeMonthlyPayment = 0;
    let afterMonthlyPayment = 0;


    /* =========================
       원리금균등상환
    ========================= */

    if (repaymentType === "equal-payment") {

        beforeMonthlyPayment =
            calculateEqualPayment(
                loanAmount,
                monthlyRate,
                remainingMonths
            );

        afterMonthlyPayment =
            calculateEqualPayment(
                remainingPrincipal,
                monthlyRate,
                remainingMonths
            );

        beforeTotalInterest =
            beforeMonthlyPayment * remainingMonths -
            loanAmount;

        afterTotalInterest =
            afterMonthlyPayment * remainingMonths -
            remainingPrincipal;
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

        afterTotalInterest =
            calculateEqualPrincipalInterest(
                remainingPrincipal,
                monthlyRate,
                remainingMonths
            );

        beforeMonthlyPayment =
            loanAmount / remainingMonths +
            loanAmount * monthlyRate;

        afterMonthlyPayment =
            remainingPrincipal / remainingMonths +
            remainingPrincipal * monthlyRate;
    }


    /* =========================
       만기일시상환
    ========================= */

    else if (repaymentType === "bullet") {

        beforeMonthlyPayment =
            loanAmount * monthlyRate;

        afterMonthlyPayment =
            remainingPrincipal * monthlyRate;

        beforeTotalInterest =
            loanAmount *
            monthlyRate *
            remainingMonths;

        afterTotalInterest =
            remainingPrincipal *
            monthlyRate *
            remainingMonths;
    }


    /* =========================
       손익 계산
    ========================= */

    const savedInterest =
        beforeTotalInterest -
        afterTotalInterest;

    const prepaymentFee =
        prepaymentAmount *
        (feeRate / 100);

    const netBenefit =
        savedInterest -
        prepaymentFee;

    const breakEvenMonths =
    calculateBreakEvenMonth(
        loanAmount,
        remainingPrincipal,
        monthlyRate,
        remainingMonths,
        repaymentType,
        prepaymentFee
    );  

    const isBeneficial =
        netBenefit > 0;


    renderBreakEvenResult({
        savedInterest,
        prepaymentFee,
        netBenefit,
        breakEvenMonths,
        remainingPrincipal,
        beforeMonthlyPayment,
        afterMonthlyPayment,
        isBeneficial
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

function calculateBreakEvenMonth(
    beforePrincipal,
    afterPrincipal,
    monthlyRate,
    months,
    repaymentType,
    prepaymentFee
) {
    // 수수료가 없으면 즉시 회수
    if (prepaymentFee <= 0) {
        return 0;
    }

    let beforeBalance = beforePrincipal;
    let afterBalance = afterPrincipal;

    let cumulativeSaving = 0;

    let beforeMonthlyPayment = 0;
    let afterMonthlyPayment = 0;

    let beforeMonthlyPrincipal = 0;
    let afterMonthlyPrincipal = 0;


    // 원리금균등
    if (repaymentType === "equal-payment") {

        beforeMonthlyPayment =
            calculateEqualPayment(
                beforePrincipal,
                monthlyRate,
                months
            );

        afterMonthlyPayment =
            calculateEqualPayment(
                afterPrincipal,
                monthlyRate,
                months
            );
    }


    // 원금균등
    else if (repaymentType === "equal-principal") {

        beforeMonthlyPrincipal =
            beforePrincipal / months;

        afterMonthlyPrincipal =
            afterPrincipal / months;
    }


    for (let month = 1; month <= months; month++) {

        const beforeInterest =
            beforeBalance * monthlyRate;

        const afterInterest =
            afterBalance * monthlyRate;


        // 이번 달 절감되는 이자
        cumulativeSaving +=
            beforeInterest -
            afterInterest;


        // 누적 절감액이 수수료 이상이면 회수 완료
        if (cumulativeSaving >= prepaymentFee) {
            return month;
        }


        /* =========================
           다음 달 원금 계산
        ========================= */

        if (repaymentType === "equal-payment") {

            const beforePrincipalPayment =
                beforeMonthlyPayment -
                beforeInterest;

            const afterPrincipalPayment =
                afterMonthlyPayment -
                afterInterest;


            beforeBalance -=
                beforePrincipalPayment;

            afterBalance -=
                afterPrincipalPayment;
        }


        else if (repaymentType === "equal-principal") {

            beforeBalance -=
                beforeMonthlyPrincipal;

            afterBalance -=
                afterMonthlyPrincipal;
        }


        else if (repaymentType === "bullet") {

            // 만기일시상환은 기간 중 원금 변화 없음
        }


        // 부동소수점 오차 방지
        beforeBalance =
            Math.max(0, beforeBalance);

        afterBalance =
            Math.max(0, afterBalance);
    }


    // 남은 대출기간 안에 수수료를 회수하지 못함
    return null;
}


/* =========================
   결과 출력
========================= */

function renderBreakEvenResult(result) {
    const resultBox =
        document.getElementById("resultBox");


    const resultTitle =
        result.isBeneficial
            ? "지금 상환이 유리합니다"
            : "지금 상환의 이득이 크지 않습니다";


    const resultDescription =
        result.isBeneficial
            ? "중도상환수수료를 제외해도 예상 이자 절감액이 더 큽니다."
            : "예상 이자 절감액보다 중도상환수수료 부담이 더 클 수 있습니다.";


    resultBox.innerHTML = `
        <h2 class="result-title">
            계산 결과
        </h2>

        <div class="result-main">

            <div class="result-main-label">
                ${resultTitle}
            </div>

            <div class="result-main-value">
                ${formatMoney(result.netBenefit)}원
            </div>

            <div class="result-main-desc">
                ${resultDescription}
            </div>

        </div>


        <div class="result-list">

            <div class="result-item">
                <span>예상 이자 절감액</span>

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
                <span>예상 순이익</span>

                <strong>
                    ${formatMoney(result.netBenefit)}원
                </strong>
            </div>


            <div class="result-item">
                <span>수수료 회수 예상기간</span>

                <strong>
                    ${
                        result.breakEvenMonths === 0
                            ? "즉시"
                            : result.breakEvenMonths === null
                                ? "대출기간 내 회수 어려움"
                                : `약 ${result.breakEvenMonths}개월 후`
                    }
                </strong>
            </div>

            <div class="result-item">
                <span>상환 후 남은 원금</span>

                <strong>
                    ${formatMoney(result.remainingPrincipal)}원
                </strong>
            </div>


            <div class="result-item">
                <span>현재 예상 월 납입액</span>

                <strong>
                    ${formatMoney(result.beforeMonthlyPayment)}원
                </strong>
            </div>


            <div class="result-item">
                <span>상환 후 예상 월 납입액</span>

                <strong>
                    ${formatMoney(result.afterMonthlyPayment)}원
                </strong>
            </div>

        </div>


        <div class="result-guide">

            <strong>계산 기준</strong>

            <p>
                입력한 금리와 남은 기간을 기준으로
                예상 이자 절감액을 계산합니다.
            </p>

            <p>
                실제 금융기관의 중도상환수수료 계산 방식과
                남은 면제기간 등에 따라 결과는 달라질 수 있습니다.
            </p>
            <p>
                수수료 회수 예상기간은 오늘 일부상환한다고 가정하고,
                이후 매월 줄어드는 이자를 누적하여 계산합니다.
            </p>

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


    input.addEventListener("input", function () {

        const rawValue =
            this.value.replace(/[^0-9]/g, "");


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
    });


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