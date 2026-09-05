function calculateDepositSwitch() {
    const depositAmount = Number(document.getElementById("depositAmount").value.replace(/,/g, ""));
    const currentRate = Number(document.getElementById("currentRate").value);
    const totalMonths = Number(document.getElementById("totalMonths").value);
    const elapsedMonths = Number(document.getElementById("elapsedMonths").value);
    const earlyTerminationRate = Number(document.getElementById("earlyTerminationRate").value);
    const newRate = Number(document.getElementById("newRate").value);
    const newMonths = Number(document.getElementById("newMonths").value);
    const resultBox = document.getElementById("resultBox");

    if (!depositAmount || !currentRate || !totalMonths || !elapsedMonths || !newRate || !newMonths) {
        resultBox.innerHTML = `<div class="result-empty">필요한 값을 모두 입력해주세요.</div>`;
        return;
    }

    if (elapsedMonths >= totalMonths) {
        resultBox.innerHTML = `<div class="result-empty">현재까지 예치한 기간은 총 가입기간보다 짧아야 합니다.</div>`;
        return;
    }

    const remainingMonths = totalMonths - elapsedMonths;

    const currentTotalInterest = depositAmount * (currentRate / 100) * (totalMonths / 12);
    const earlyTerminationInterest = depositAmount * (earlyTerminationRate / 100) * (elapsedMonths / 12);

    const newSamePeriodInterest = depositAmount * (newRate / 100) * (remainingMonths / 12);
    const switchSamePeriodTotal = earlyTerminationInterest + newSamePeriodInterest;
    const samePeriodBenefit = switchSamePeriodTotal - currentTotalInterest;

    const newMaturityInterest = depositAmount * (newRate / 100) * (newMonths / 12);
    const switchMaturityTotal = earlyTerminationInterest + newMaturityInterest;

    renderDepositSwitchResult({
        remainingMonths,
        currentTotalInterest,
        earlyTerminationInterest,
        newSamePeriodInterest,
        switchSamePeriodTotal,
        samePeriodBenefit,
        newMonths,
        newMaturityInterest,
        switchMaturityTotal
    });
}

function renderDepositSwitchResult(result) {
    const resultBox = document.getElementById("resultBox");
    const isBenefit = result.samePeriodBenefit >= 0;

    resultBox.innerHTML = `
        <h2 class="result-title">계산 결과</h2>

        <div class="result-main">
            <div class="result-main-label">
                ${isBenefit
                    ? "현재 예금 만기일 기준 갈아타기 예상 이득"
                    : "현재 예금 만기일 기준 갈아타기 예상 손해"}
            </div>

            <div class="result-main-value">
                ${isBenefit ? "+" : "-"}${formatMoney(Math.abs(result.samePeriodBenefit))}원
            </div>

            <div class="result-main-desc">
                기존 예금의 남은 ${result.remainingMonths}개월과 같은 기간을 기준으로 비교한 결과입니다.
            </div>
        </div>

        <div class="result-list">
            <div class="result-item">
                <span>기존 예금 만기까지 유지 시 예상 총이자</span>
                <strong>${formatMoney(result.currentTotalInterest)}원</strong>
            </div>

            <div class="result-item">
                <span>지금 중도해지 시 예상 이자</span>
                <strong>${formatMoney(result.earlyTerminationInterest)}원</strong>
            </div>

            <div class="result-item">
                <span>새 금리로 ${result.remainingMonths}개월 운용 시 예상 이자</span>
                <strong>${formatMoney(result.newSamePeriodInterest)}원</strong>
            </div>

            <div class="result-item">
                <span>현재 예금 만기일 기준 갈아타기 예상 총이자</span>
                <strong>${formatMoney(result.switchSamePeriodTotal)}원</strong>
            </div>
        </div>

        <div class="result-guide">
            <strong>새 예금 만기 기준</strong>

            <p>
                새 예금을 ${result.newMonths}개월 동안 유지할 경우
                예상 이자는 ${formatMoney(result.newMaturityInterest)}원입니다.
            </p>

            <p>
                중도해지 이자를 포함한 갈아타기 예상 총이자는
                ${formatMoney(result.switchMaturityTotal)}원입니다.
            </p>
        </div>

        <div class="result-guide">
            <strong>계산 기준</strong>
            <p>단순 연이율 기준으로 계산하며 세전 기준입니다.</p>
            <p>실제 은행별 중도해지이율, 우대금리, 복리 여부에 따라 결과는 달라질 수 있습니다.</p>
        </div>
    `;
}

function formatMoney(value) {
    return Math.round(value).toLocaleString("ko-KR");
}

const moneyInput = document.getElementById("depositAmount");
const koreanText = document.getElementById("depositAmountKorean");

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

    if (eok > 0) parts.push(`${eok.toLocaleString("ko-KR")}억`);
    if (man > 0) parts.push(`${man.toLocaleString("ko-KR")}만원`);
    if (won > 0) parts.push(`${won.toLocaleString("ko-KR")}원`);

    return parts.join(" ");
}

document
    .getElementById("calculateButton")
    .addEventListener("click", calculateDepositSwitch);