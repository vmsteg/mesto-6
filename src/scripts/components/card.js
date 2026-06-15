export const setLikeButtonState = (likeButton, isLiked) => {
  likeButton.classList.toggle("card__like-button_is-active", isLiked);
};

export const updateLikeCount = (cardElement, likes) => {
  cardElement.querySelector(".card__like-count").textContent = likes.length;
};

export const deleteCard = (cardElement) => {
  cardElement.remove();
};

const getTemplate = () => {
  return document
    .getElementById("card-template")
    .content.querySelector(".card")
    .cloneNode(true);
};

export const createCardElement = (
  data,
  { onPreviewPicture, onLikeIcon, onDeleteCard, userId }
) => {
  const cardElement = getTemplate();
  const likeButton = cardElement.querySelector(".card__like-button");
  const deleteButton = cardElement.querySelector(
    ".card__control-button_type_delete"
  );
  const cardImage = cardElement.querySelector(".card__image");

  cardElement.dataset.cardId = data._id;
  cardImage.src = data.link;
  cardImage.alt = data.name;
  cardElement.querySelector(".card__title").textContent = data.name;

  updateLikeCount(cardElement, data.likes);

  const isLiked = data.likes.some((user) => user._id === userId);
  setLikeButtonState(likeButton, isLiked);

  if (data.owner._id !== userId) {
    deleteButton.remove();
  } else if (onDeleteCard) {
    deleteButton.addEventListener("click", () =>
      onDeleteCard(cardElement, data._id)
    );
  }

  if (onLikeIcon) {
    likeButton.addEventListener("click", () =>
      onLikeIcon(cardElement, data._id, likeButton)
    );
  }

  if (onPreviewPicture) {
    cardImage.addEventListener("click", () =>
      onPreviewPicture({ name: data.name, link: data.link })
    );
  }

  return cardElement;
};
