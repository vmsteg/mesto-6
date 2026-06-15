const showInputError = (formElement, inputElement, validationSettings) => {
  const errorElement = formElement.querySelector(`#${inputElement.id}-error`);
  const errorMessage =
    inputElement.validity.patternMismatch && inputElement.dataset.errorMessage
      ? inputElement.dataset.errorMessage
      : inputElement.validationMessage;

  inputElement.classList.add(validationSettings.inputErrorClass);
  errorElement.textContent = errorMessage;
  errorElement.classList.add(validationSettings.errorClass);
};

const hideInputError = (formElement, inputElement, validationSettings) => {
  const errorElement = formElement.querySelector(`#${inputElement.id}-error`);

  inputElement.classList.remove(validationSettings.inputErrorClass);
  errorElement.textContent = "";
  errorElement.classList.remove(validationSettings.errorClass);
};

const checkInputValidity = (formElement, inputElement, validationSettings) => {
  if (inputElement.validity.valid) {
    hideInputError(formElement, inputElement, validationSettings);
  } else {
    showInputError(formElement, inputElement, validationSettings);
  }
};

const hasInvalidInput = (formElement, validationSettings) => {
  return Array.from(
    formElement.querySelectorAll(validationSettings.inputSelector)
  ).some((inputElement) => !inputElement.validity.valid);
};

const disableSubmitButton = (formElement, validationSettings) => {
  const submitButton = formElement.querySelector(
    validationSettings.submitButtonSelector
  );

  submitButton.classList.add(validationSettings.inactiveButtonClass);
  submitButton.disabled = true;
};

const enableSubmitButton = (formElement, validationSettings) => {
  const submitButton = formElement.querySelector(
    validationSettings.submitButtonSelector
  );

  submitButton.classList.remove(validationSettings.inactiveButtonClass);
  submitButton.disabled = false;
};

const toggleButtonState = (formElement, validationSettings) => {
  if (hasInvalidInput(formElement, validationSettings)) {
    disableSubmitButton(formElement, validationSettings);
  } else {
    enableSubmitButton(formElement, validationSettings);
  }
};

const setEventListeners = (formElement, validationSettings) => {
  const inputList = Array.from(
    formElement.querySelectorAll(validationSettings.inputSelector)
  );

  inputList.forEach((inputElement) => {
    inputElement.addEventListener("input", () => {
      checkInputValidity(formElement, inputElement, validationSettings);
      toggleButtonState(formElement, validationSettings);
    });
  });
};

export const clearValidation = (formElement, validationSettings) => {
  const inputList = Array.from(
    formElement.querySelectorAll(validationSettings.inputSelector)
  );

  inputList.forEach((inputElement) => {
    hideInputError(formElement, inputElement, validationSettings);
  });

  disableSubmitButton(formElement, validationSettings);
};

export const enableValidation = (validationSettings) => {
  const formList = Array.from(
    document.querySelectorAll(validationSettings.formSelector)
  );

  formList.forEach((formElement) => {
    setEventListeners(formElement, validationSettings);
    toggleButtonState(formElement, validationSettings);
  });
};
