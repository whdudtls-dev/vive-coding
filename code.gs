const SPREADSHEET_ID = '여기에_본인의_스프레드시트_ID_입력';
const SHEET_NAME = '명예의 전당';

function doGet(e) {
  // HTML 파일을 웹 페이지로 만들어 반환합니다.
  return HtmlService.createTemplateFromFile('index').evaluate()
      .setTitle('분수 팡팡!')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function submitScore(data) {
  try {
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAME);
    // 이름, 점수, 현재 시간을 시트에 추가합니다.
    sheet.appendRow([data.name, data.score, new Date()]);
    // [FIX] 변경사항을 시트에 즉시 적용하여 캐시 문제를 해결합니다.
    SpreadsheetApp.flush();
    return { status: 'success' };
  } catch (e) {
    return { status: 'error', message: e.message };
  }
}

function getHallOfFameData() {
  try {
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAME);
    if (!sheet) {
      return { error: `시트 이름 '${SHEET_NAME}'을 찾을 수 없습니다.` };
    }
    const dataRange = sheet.getDataRange();
    const values = dataRange.getValues();
    
    // 비어있는 행이나 잘못된 데이터가 있어도 오류가 나지 않도록 코드를 보강했습니다.
    const records = values
      .slice(1) // 헤더 행 제외
      .filter(row => row && row[0] && row[0].toString().trim() !== '') // 이름이 비어있지 않은 행만 처리
      .map(row => {
        return {
          name: row[0],
          score: parseInt(row[1], 10) || 0 // 점수가 숫자가 아니면 0으로 처리
        };
      });

    // 점수가 높은 순서대로 정렬합니다.
    records.sort((a, b) => b.score - a.score);
    
    return records;
  } catch (e) {
    // 오류 발생 시 클라이언트에 오류 객체를 반환합니다.
    return { error: e.message };
  }
}

