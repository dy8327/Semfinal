function calculateSavingsSwitch() {
    const monthlyAmount = getMoney("currentMonthlyAmount");
    const currentRate = Number(document.getElementById("currentRate").value);
    const totalMonths = Number(document.getElementById("totalMonths").value);
    const elapsedMonths = Number(document.getElementById("elapsedMonths").value);
    const earlyTerminationRate = Number(document.getElementById("earlyTerminationRate").value);
    const newRate = Number(document.getElementById("newRate").value);
    const newMonths = Number(document.getElementById("newMonths").value);
    const resultBox = document.getElementById("resultBox");

    if (!monthlyAmount || !currentRate || !totalMonths || !elapsedMonths || !newRate || !newMonths) {
        resultBox.innerHTML = `<div class="result-empty">필요한 값을 모두 입력해주세요.</div>`;
        return;
    }

    if (elapsedMonths >= totalMonths) {
        resultBox.innerHTML = `<div class="result-empty">현재까지 납입한 개월은 약정기간보다 짧아야 합니다.</div>`;
        return;
    }

    const remainingMonths = totalMonths - elapsedMonths;

    const currentMaturityInterest = calculateSavingsInterest(
        monthlyAmount,
        currentRate,
        totalMonths
    );

    const earlyTerminationInterest = calculateSavingsInterest(
        monthlyAmount,
        earlyTerminationRate,
        elapsedMonths
    );

    const newSamePeriodInterest = calculateSavingsInterest(
        monthlyAmount,
        newRate,
        remainingMonths
    );

    const switchSamePeriodInterest =
        earlyTerminationInterest + newSamePeriodInterest;

    const interestBenefit =
        switchSamePeriodInterest - currentMaturityInterest;

    const newMaturityPrincipal =
        monthlyAmount * newMonths;

    const newMaturityInterest = calculateSavingsInterest(
        monthlyAmount,
        newRate,
        newMonths
    );

    const newMaturityAmount =
        newMaturityPrincipal + newMaturityInterest;

    renderSavingsSwitchResult({
        monthlyAmount,
        remainingMonths,
        currentMaturityInterest,
        earlyTerminationInterest,
        newSamePeriodInterest,
        switchSamePeriodInterest,
        interestBenefit,
        newMonths,
        newMaturityPrincipal,
        newMaturityInterest,
        newMaturityAmount
    });
}


function calculateSavingsInterest(monthlyAmount, annualRate, months) {
    const monthlyRate = annualRate / 100 / 12;
    let totalInterest = 0;

    for (let holdingMonths = months; holdingMonths >= 1; holdingMonths--) {
        totalInterest += monthlyAmount * monthlyRate * holdingMonths;
    }

    return totalInterest;
}


function renderSavingsSwitchResult(result) {
    const resultBox = document.getElementById("resultBox");
    const isBenefit = result.interestBenefit >= 0;

    resultBox.innerHTML = `
        <h2 class="result-title">계산 결과</h2>

        <div class="result-main">
            <div class="result-main-label">
                ${isBenefit
                    ? "현재 적금 만기일 기준 갈아타기 예상 이자 이득"
                    : "현재 적금 만기일 기준 갈아타기 예상 이자 손해"}
            </div>

            <div class="result-main-value">
                ${isBenefit ? "+" : "-"}${formatMoney(Math.abs(result.interestBenefit))}원
            </div>

            <div class="result-main-desc">
                현재 월 납입액 ${formatMoney(result.monthlyAmount)}원을 그대로 유지한다고 가정하고,
                남은 ${result.remainingMonths}개월과 같은 기간을 기준으로 비교한 결과입니다.
            </div>
        </div>

        <div class="result-list">
            <div class="result-item">
                <span>현재 적금 만기 유지 시 예상 이자</span>
                <strong>${formatMoney(result.currentMaturityInterest)}원</strong>
            </div>

            <div class="result-item">
                <span>지금 중도해지 시 예상 이자</span>
                <strong>${formatMoney(result.earlyTerminationInterest)}원</strong>
            </div>

            <div class="result-item">
                <span>새 적금으로 ${result.remainingMonths}개월 운용 시 예상 이자</span>
                <strong>${formatMoney(result.newSamePeriodInterest)}원</strong>
            </div>

            <div class="result-item">
                <span>현재 적금 만기일 기준 갈아타기 예상 총이자</span>
                <strong>${formatMoney(result.switchSamePeriodInterest)}원</strong>
            </div>
        </div>

        <div class="result-guide">
            <strong>새 적금 만기 기준</strong>
            <p>월 납입액: ${formatMoney(result.monthlyAmount)}원</p>
            <p>총 납입원금: ${formatMoney(result.newMaturityPrincipal)}원</p>
            <p>예상 이자: ${formatMoney(result.newMaturityInterest)}원</p>
            <p>예상 만기금액: ${formatMoney(result.newMaturityAmount)}원</p>
        </div>

        <div class="result-guide">
            <strong>계산 기준</strong>
            <p>현재 적금과 새 적금의 월 납입액은 동일하다고 가정합니다.</p>
            <p>각 월 납입금이 실제로 예치되는 기간을 반영해 단순 연이율로 계산합니다.</p>
            <p>세전 기준이며 실제 금융기관의 납입일, 중도해지이율, 우대금리, 일수 계산 방식에 따라 결과가 달라질 수 있습니다.</p>
        </div>
    `;
}


function getMoney(id) {
    return Number(
        document.getElementById(id).value.replace(/,/g, "")
    );
}


function formatMoney(value) {
    return Math.round(value).toLocaleString("ko-KR");
}


const moneyInput = document.getElementById("currentMonthlyAmount");
const koreanText = document.getElementById("currentMonthlyAmountKorean");

moneyInput.addEventListener("input", function () {
    const rawValue = this.value.replace(/[^0-9]/g, "");

    if (!rawValue) {
        this.value = "";
        koreanText.textContent = "";
        return;
    }

    const number = Number(rawValue);

    this.value = number.toLocaleString("ko-KR");
    koreanText.textContent = formatKoreanMoney(number);
});


function formatKoreanMoney(number) {
    if (!number || number <= 0) return "";

    const eok = Math.floor(number / 100000000);
    const man = Math.floor((number % 100000000) / 10000);
    const won = number % 10000;
    const parts = [];

    if (eok > 0) {
        parts.push(`${eok.toLocaleString("ko-KR")}억`);
    }

    if (man > 0) {
        parts.push(`${man.toLocaleString("ko-KR")}만원`);
    }

    if (won > 0) {
        parts.push(`${won.toLocaleString("ko-KR")}원`);
    }

    return parts.join(" ");
}