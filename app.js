function mergeImages() {
  const userNameInput = document.getElementById('userName');
  const userSNameInput = document.getElementById('userSName');
  const userJobTitleInput = document.getElementById('userJobTitle');
  const userImageInput = document.getElementById('userImage');
  const userImageFile = userImageInput.files[0];
  const serverImageSelect = document.getElementById('serverImage');
  const serverImagePath = serverImageSelect.value;

  // Obtém os valores inseridos pelo usuário
  const userName = userNameInput.value;
  const userSName = userSNameInput.value;
  const userJobTitle = userJobTitleInput.value;

  const serverImage = new Image();
  serverImage.src = serverImagePath;

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  const mergedImage = document.getElementById('mergedImage');

  const imageLoadPromises = [];

  // Verifica se o usuário selecionou uma imagem
  if (userImageFile) {
    // Carrega a imagem do usuário
    const userImageLoadPromise = new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = function (event) {
        const img = new Image();
        img.onload = function () {
          resolve(img);
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(userImageFile);
    });

    imageLoadPromises.push(userImageLoadPromise);
  } else {
    // Caso o usuário não tenha selecionado uma imagem, define uma imagem padrão
    const defaultUserImage = new Image();
    if (serverImagePath == './NiverFem.png') {
      defaultUserImage.src = './fem.png';
    } else {
      defaultUserImage.src = './masc.png';
    }

    const defaultUserImageLoadPromise = new Promise((resolve, reject) => {
      defaultUserImage.onload = function () {
        resolve(defaultUserImage);
      };
      defaultUserImage.onerror = reject;
    });

    imageLoadPromises.push(defaultUserImageLoadPromise);
  }

  const serverImageLoadPromise = new Promise((resolve, reject) => {
    serverImage.onload = function () {
      resolve(serverImage);
    };
    serverImage.onerror = reject;
  });

  imageLoadPromises.push(serverImageLoadPromise);

  // Mescla as imagens quando todas estiverem carregadas
  Promise.all(imageLoadPromises)
    .then(images => {
      let userImage = images[0];

      // Define o tamanho padrão desejado
      const imageSizeThreshold = 500; // Tamanho em pixels

      // Verifica se a imagem do usuário está abaixo do tamanho padrão
      if (userImage.width < imageSizeThreshold || userImage.height < imageSizeThreshold) {
        // Calcula as proporções para redimensionar a imagem mantendo a proporção original
        let scaleFactor = 1;
        if (userImage.width < userImage.height) {
          scaleFactor = imageSizeThreshold / userImage.width;
        } else {
          scaleFactor = imageSizeThreshold / userImage.height;
        }

        // Define o novo tamanho da imagem
        const newWidth = Math.round(userImage.width * scaleFactor);
        const newHeight = Math.round(userImage.height * scaleFactor);

        // Cria um novo canvas para a imagem redimensionada
        const resizedCanvas = document.createElement('canvas');
        resizedCanvas.width = newWidth;
        resizedCanvas.height = newHeight;
        const resizedCtx = resizedCanvas.getContext('2d');

        // Desenha a imagem original redimensionada no canvas
        resizedCtx.drawImage(userImage, 0, 0, newWidth, newHeight);

        // Cria um novo elemento de imagem para a imagem redimensionada
        const resizedImage = new Image();
        resizedImage.onload = function () {
          // Define a imagem redimensionada como a nova imagem do usuário
          userImage = resizedImage;

          // Continua o processo de mesclagem das imagens
          mergeImagesOnCanvas(userImage, serverImage, canvas, ctx, mergedImage, userName, userSName, userJobTitle, serverImagePath);
        };
        resizedImage.src = resizedCanvas.toDataURL();
      } if (userImage.width > imageSizeThreshold || userImage.height > imageSizeThreshold) {
        const cropCanvas = document.createElement('canvas');
        cropCanvas.width = 500;
        cropCanvas.height = 500;
        const cropCTX = cropCanvas.getContext('2d');
        cropCTX.drawImage(userImage, 0, 0, 500, 500);
        const cropImage = new Image();
        cropImage.onload = function () {

          userImage = cropImage;
          mergeImagesOnCanvas(userImage, serverImage, canvas, ctx, mergedImage, userName, userSName, userJobTitle, serverImagePath);
        }
        cropImage.src = cropCanvas.toDataURL();

      } else {
        // Continua o processo de mesclagem das imagens
        mergeImagesOnCanvas(userImage, serverImage, canvas, ctx, mergedImage, userName, userSName, userJobTitle, serverImagePath);
      }
    })
    .catch(error => {
      console.error('Erro ao carregar as imagens:', error);
    });
}

function mergeImagesOnCanvas(userImage, serverImage, canvas, ctx, mergedImage, userName, userSName, userJobTitle, serverImagePath) {
  // Define o tamanho do canvas
  canvas.width = Math.max(userImage.width, serverImage.width);
  canvas.height = Math.max(userImage.height, serverImage.height);

  // Desenha as imagens no canvas
  ctx.drawImage(userImage, 510, 160);
  ctx.drawImage(serverImage, 0, 0);

  ctx.fillStyle = 'white';
  ctx.font = '32px berlinfb';
  // Desenha o cargo do usuário no canvas
  ctx.fillText(userJobTitle, 600, 650);
  // Define o estilo de texto para os dados do usuário
  ctx.shadowColor = 'rgba(255, 255, 255, 0.7)'; // Define a cor da sombra (preto com transparência)
  ctx.shadowOffsetX = 3; // Define o deslocamento horizontal da sombra
  ctx.shadowOffsetY = 3; // Define o deslocamento vertical da sombra
  ctx.shadowBlur = 1; // Define o desfoque da sombra
  if (serverImagePath == './NiverMasc.png') {
    ctx.fillStyle = '#3e4095';
  } else {
    ctx.fillStyle = '#ec2c92';
  }

  // Desenha o nome do usuário no canvas
  ctx.font = '60px berlinfb';
  ctx.fillText(userName, 330, 500);
  ctx.fillText(userSName, 400, 560);

  // Exibe a imagem mesclada removendo a classe "hidden"
  mergedImage.classList.remove('hidden');

  // Define a imagem mesclada como a imagem de saída
  mergedImage.src = canvas.toDataURL();
}