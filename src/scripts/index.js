/*
  Файл index.js является точкой входа в наше приложение
  и только он должен содержать логику инициализации нашего приложения
  используя при этом импорты из других файлов

  Из index.js не допускается что то экспортировать
*/

import {
  getUserInfo,
  getCardList,
  setUserInfo,
  setUserAvatar,
  addCard,
  deleteCardFromServer,
  changeLikeCardStatus,
} from "./components/api.js";
import {
  createCardElement,
  deleteCard,
  setLikeButtonState,
  updateLikeCount,
} from "./components/card.js";
import {
  openModalWindow,
  closeModalWindow,
  setCloseModalWindowEventListeners,
} from "./components/modal.js";
import { enableValidation, clearValidation } from "./components/validation.js";

const validationSettings = {
  formSelector: ".popup__form",
  inputSelector: ".popup__input",
  submitButtonSelector: ".popup__button",
  inactiveButtonClass: "popup__button_disabled",
  inputErrorClass: "popup__input_type_error",
  errorClass: "popup__error_visible",
};

// DOM узлы
const placesWrap = document.querySelector(".places__list");
const profileFormModalWindow = document.querySelector(".popup_type_edit");
const profileForm = profileFormModalWindow.querySelector(".popup__form");
const profileTitleInput = profileForm.querySelector(".popup__input_type_name");
const profileDescriptionInput = profileForm.querySelector(
  ".popup__input_type_description"
);

const cardFormModalWindow = document.querySelector(".popup_type_new-card");
const cardForm = cardFormModalWindow.querySelector(".popup__form");
const cardNameInput = cardForm.querySelector(".popup__input_type_card-name");
const cardLinkInput = cardForm.querySelector(".popup__input_type_url");
const cardSubmitButton = cardForm.querySelector(".popup__button");

const imageModalWindow = document.querySelector(".popup_type_image");
const imageElement = imageModalWindow.querySelector(".popup__image");
const imageCaption = imageModalWindow.querySelector(".popup__caption");

const openProfileFormButton = document.querySelector(".profile__edit-button");
const openCardFormButton = document.querySelector(".profile__add-button");
const siteLogo = document.querySelector(".header__logo");

const profileTitle = document.querySelector(".profile__title");
const profileDescription = document.querySelector(".profile__description");
const profileAvatar = document.querySelector(".profile__image");

const avatarFormModalWindow = document.querySelector(".popup_type_edit-avatar");
const avatarForm = avatarFormModalWindow.querySelector(".popup__form");
const avatarInput = avatarForm.querySelector(".popup__input");
const avatarSubmitButton = avatarForm.querySelector(".popup__button");

const removeCardModalWindow = document.querySelector(".popup_type_remove-card");
const removeCardForm = removeCardModalWindow.querySelector(".popup__form");
const removeCardSubmitButton = removeCardForm.querySelector(".popup__button");

const infoModalWindow = document.querySelector(".popup_type_info");
const infoDefinitionTemplate = document.getElementById(
  "popup-info-definition-template"
);
const infoUserPreviewTemplate = document.getElementById(
  "popup-info-user-preview-template"
);

const profileSubmitButton = profileForm.querySelector(".popup__button");

let userId = "";
let cardToDelete = null;
let cardIdToDelete = null;

const setButtonLoading = (button, isLoading, loadingText, defaultText) => {
  button.textContent = isLoading ? loadingText : defaultText;
};

const renderUserInfo = ({ name, about, avatar, _id }) => {
  userId = _id;
  profileTitle.textContent = name;
  profileDescription.textContent = about;
  profileAvatar.style.backgroundImage = `url(${avatar})`;
};

const renderCards = (cards) => {
  placesWrap.innerHTML = "";
  cards.forEach((cardData) => {
    placesWrap.append(
      createCardElement(cardData, {
        onPreviewPicture: handlePreviewPicture,
        onLikeIcon: handleLikeClick,
        onDeleteCard: handleDeleteClick,
        userId,
      })
    );
  });
};

const handlePreviewPicture = ({ name, link }) => {
  imageElement.src = link;
  imageElement.alt = name;
  imageCaption.textContent = name;
  openModalWindow(imageModalWindow);
};

const handleProfileFormSubmit = (evt) => {
  evt.preventDefault();
  setButtonLoading(profileSubmitButton, true, "Сохранение...", "Сохранить");

  setUserInfo({
    name: profileTitleInput.value,
    about: profileDescriptionInput.value,
  })
    .then((userData) => {
      profileTitle.textContent = userData.name;
      profileDescription.textContent = userData.about;
      closeModalWindow(profileFormModalWindow);
    })
    .catch((err) => {
      console.log(err);
    })
    .finally(() => {
      setButtonLoading(profileSubmitButton, false, "Сохранение...", "Сохранить");
    });
};

const handleAvatarFormSubmit = (evt) => {
  evt.preventDefault();
  setButtonLoading(avatarSubmitButton, true, "Сохранение...", "Сохранить");

  setUserAvatar(avatarInput.value)
    .then((userData) => {
      profileAvatar.style.backgroundImage = `url(${userData.avatar})`;
      avatarForm.reset();
      closeModalWindow(avatarFormModalWindow);
    })
    .catch((err) => {
      console.log(err);
    })
    .finally(() => {
      setButtonLoading(avatarSubmitButton, false, "Сохранение...", "Сохранить");
    });
};

const handleCardFormSubmit = (evt) => {
  evt.preventDefault();
  setButtonLoading(cardSubmitButton, true, "Создание...", "Создать");

  addCard({
    name: cardNameInput.value,
    link: cardLinkInput.value,
  })
    .then((newCard) => {
      placesWrap.prepend(
        createCardElement(newCard, {
          onPreviewPicture: handlePreviewPicture,
          onLikeIcon: handleLikeClick,
          onDeleteCard: handleDeleteClick,
          userId,
        })
      );
      cardForm.reset();
      closeModalWindow(cardFormModalWindow);
    })
    .catch((err) => {
      console.log(err);
    })
    .finally(() => {
      setButtonLoading(cardSubmitButton, false, "Создание...", "Создать");
    });
};

const handleLikeClick = (cardElement, cardId, likeButton) => {
  const isLiked = likeButton.classList.contains("card__like-button_is-active");

  changeLikeCardStatus(cardId, isLiked)
    .then((updatedCard) => {
      const likedByUser = updatedCard.likes.some((user) => user._id === userId);
      setLikeButtonState(likeButton, likedByUser);
      updateLikeCount(cardElement, updatedCard.likes);
    })
    .catch((err) => {
      console.log(err);
    });
};

const handleDeleteClick = (cardElement, cardId) => {
  cardToDelete = cardElement;
  cardIdToDelete = cardId;
  openModalWindow(removeCardModalWindow);
};

const handleRemoveCardSubmit = (evt) => {
  evt.preventDefault();
  setButtonLoading(removeCardSubmitButton, true, "Удаление...", "Да");

  deleteCardFromServer(cardIdToDelete)
    .then(() => {
      deleteCard(cardToDelete);
      closeModalWindow(removeCardModalWindow);
      cardToDelete = null;
      cardIdToDelete = null;
    })
    .catch((err) => {
      console.log(err);
    })
    .finally(() => {
      setButtonLoading(removeCardSubmitButton, false, "Удаление...", "Да");
    });
};

const getCardStatistics = (cards) => {
  const owners = new Set(cards.map((card) => card.owner._id));
  const totalUsers = owners.size;
  const totalLikes = cards.reduce((sum, card) => sum + card.likes.length, 0);

  const likesByUser = {};

  cards.forEach((card) => {
    card.likes.forEach((user) => {
      if (!likesByUser[user._id]) {
        likesByUser[user._id] = { count: 0, user };
      }
      likesByUser[user._id].count += 1;
    });
  });

  let maxLikesFromOne = 0;
  let champion = null;

  Object.values(likesByUser).forEach(({ count, user }) => {
    if (count > maxLikesFromOne) {
      maxLikesFromOne = count;
      champion = user;
    }
  });

  const sortedCards = [...cards].sort(
    (firstCard, secondCard) => secondCard.likes.length - firstCard.likes.length
  );
  const popularCards = sortedCards.slice(0, 3).map((card) => card.name);

  return {
    totalUsers,
    totalLikes,
    maxLikesFromOne,
    champion,
    popularCards,
  };
};

const fillInfoDefinition = (term, description) => {
  const item = infoDefinitionTemplate.content.cloneNode(true);
  item.querySelector(".popup__info-term").textContent = term;
  item.querySelector(".popup__info-description").textContent = description;
  return item;
};

const fillInfoChampion = (champion) => {
  const item = infoDefinitionTemplate.content.cloneNode(true);
  const descriptionElement = item.querySelector(".popup__info-description");

  item.querySelector(".popup__info-term").textContent = "Чемпион лайков";

  if (champion) {
    const badge = infoUserPreviewTemplate.content.cloneNode(true);
    badge.querySelector(".popup__list-item").textContent = champion.name;
    descriptionElement.append(badge);
  } else {
    descriptionElement.textContent = "—";
  }

  return item;
};

const handleInfoClick = () => {
  getCardList()
    .then((cards) => {
      const stats = getCardStatistics(cards);
      const infoList = infoModalWindow.querySelector(".popup__info");
      const popularCardsList = infoModalWindow.querySelector(".popup__list");

      infoList.replaceChildren(
        fillInfoDefinition("Всего пользователей", stats.totalUsers),
        fillInfoDefinition("Всего лайков", stats.totalLikes),
        fillInfoDefinition(
          "Максимально лайков от одного",
          stats.maxLikesFromOne
        ),
        fillInfoChampion(stats.champion)
      );

      popularCardsList.replaceChildren(
        ...stats.popularCards.map((cardName) => {
          const listItem = document.createElement("li");
          listItem.className = "popup__list-item";
          listItem.textContent = cardName;
          return listItem;
        })
      );

      openModalWindow(infoModalWindow);
    })
    .catch((err) => {
      console.log(err);
    });
};

// EventListeners
profileForm.addEventListener("submit", handleProfileFormSubmit);
cardForm.addEventListener("submit", handleCardFormSubmit);
avatarForm.addEventListener("submit", handleAvatarFormSubmit);
removeCardForm.addEventListener("submit", handleRemoveCardSubmit);

openProfileFormButton.addEventListener("click", () => {
  profileTitleInput.value = profileTitle.textContent;
  profileDescriptionInput.value = profileDescription.textContent;
  clearValidation(profileForm, validationSettings);
  openModalWindow(profileFormModalWindow);
});

profileAvatar.addEventListener("click", () => {
  avatarForm.reset();
  clearValidation(avatarForm, validationSettings);
  openModalWindow(avatarFormModalWindow);
});

openCardFormButton.addEventListener("click", () => {
  cardForm.reset();
  clearValidation(cardForm, validationSettings);
  openModalWindow(cardFormModalWindow);
});

siteLogo.addEventListener("click", handleInfoClick);

removeCardModalWindow.addEventListener("mousedown", (evt) => {
  if (evt.target.classList.contains("popup")) {
    cardToDelete = null;
    cardIdToDelete = null;
  }
});

removeCardModalWindow
  .querySelector(".popup__close")
  .addEventListener("click", () => {
    cardToDelete = null;
    cardIdToDelete = null;
  });

// настраиваем обработчики закрытия попапов
const allPopups = document.querySelectorAll(".popup");
allPopups.forEach((popup) => {
  setCloseModalWindowEventListeners(popup);
});

enableValidation(validationSettings);

Promise.all([getCardList(), getUserInfo()])
  .then(([cards, userData]) => {
    renderUserInfo(userData);
    renderCards(cards);
  })
  .catch((err) => {
    console.log(err);
  });
