// Keep native POST submission and spam protection; validate international formats.
(() => {
  const phone = document.querySelector('input[name="phone"]');
  if (!phone) return;
  const validate = () => {
    const value = phone.value.trim();
    const digits = value.replace(/\D/g, '');
    const valid = /^[+\d\s().-]+$/.test(value) && digits.length >= 6 && digits.length <= 15 &&
      (!value.includes('+') || (value.startsWith('+') && value.lastIndexOf('+') === 0));
    phone.setCustomValidity(!value || valid ? '' : document.body.dataset.lang === 'en' ?
      'Please enter a valid phone number, including a country code if needed.' :
      '휴대전화 번호를 확인해 주세요. 국가번호, 숫자, 공백, 괄호와 하이픈을 사용할 수 있습니다.');
  };
  phone.addEventListener('input', validate);
  validate();
})();
