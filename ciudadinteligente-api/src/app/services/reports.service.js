const pathFile = require('path');
const puppeteer = require('puppeteer');
const { sequelize } = require('../../infrastructure/database/database');

const { Dependency } = require('../../infrastructure/models/projects/dependencies.model');
const { DependencyProjects } = require('../../infrastructure/models/projects/dependencies-projects.model');
const { Projects } = require('../../infrastructure/models/projects/projects.model');
const { Systems } = require('../../infrastructure/models/projects/systems.model');
const { Progress } = require('../../infrastructure/models/projects/progress.model');

const { readableDate } = require('../helpers/parse-date.hepler');
// Tamaño en puntos (72 pt = 1 in)
const PDFDocument = require('pdfkit');

const exportReportForDependencyService = async (dependencyId, month, year, path, ip, userId) => {
  return sequelize.transaction(async (t) => {
    const dependency = await DependencyProjects.findAll({
      where: { dependencyId, isDelete: false },
      include: [
        {
          model: Dependency,
          as: 'Dependency'
        },
        {
          model: Projects,
          as: 'Project'
        }
      ]
    })

    const formattedDependency = dependency.map(d => ({
      ...d.dataValues,
      initDateFormatted: readableDate(d.initDate),
      finalDateFormatted: readableDate(d.finalDate)
    }));

    const systemsByRelation = {};

    for (const dep of dependency) {
      const relationId = dep.idRelation;
      const systems = await Systems.findAll({
        where: { idRelation: relationId, isDelete: false }
      });

      const systemsWithProgress = [];
      for (const sys of systems) {
        const progress = await Progress.findAll({
          where: { systemsId: sys.systemsId, year, isDelete: false }
        });
        systemsWithProgress.push({
          ...sys.dataValues,
          progress: progress.map(p => p.dataValues)
        });
      }

      systemsByRelation[relationId] = systemsWithProgress;
    }

    const dependencyWithSystems = formattedDependency.map(d => ({
      ...d,
      systems: systemsByRelation[d.idRelation] || []
    }));

    // Ruta absoluta del HTML base
    const htmlPath = pathFile.join(process.cwd(), '/public/index.html');

    // Abrir navegador en modo headless
    const browser = await puppeteer.launch({
      headless: 'new',
      // executablePath: '/usr/bin/chromium-browser', // 👈 FUERZA A USAR CHROMIUM DEL DOCKER
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--disable-software-rasterizer'
      ]
    });
    const page = await browser.newPage();

    // ✅ Cargar el HTML directamente desde el sistema de archivos (con sus estilos e imágenes)
    await page.goto(`file://${htmlPath}`, { waitUntil: 'networkidle0' });

    // Reemplazar {{DEPENDENCY}} dentro del HTML renderizado
    await page.evaluate((dep) => {
      const container = document.querySelector('#report-container') || document.body;
      container.innerHTML = container.innerHTML.replace(/{{DEPENDENCY}}/g, dep);
    }, String(dependency[0].Dependency?.name ?? ''));

    // Insertar bloques .box dinámicamente después de .personaje
    await page.evaluate((items) => {
      const personaje = document.querySelector('.personaje');
      if (!personaje) return;

      items.forEach((item) => {
        const box = document.createElement('div');
        box.className = 'box';

        const boxLeft = document.createElement('div');
        boxLeft.className = 'box-left';

        const img = document.createElement('img');
        img.src = "./images/box.png";
        img.alt = "Box";
        img.className = "img-box";

        const contain = document.createElement('div');
        contain.className = 'contain';

        const p2 = document.createElement('p');
        p2.className = 'message-2';

        const span3 = document.createElement('span');
        span3.className = 'message-3';
        span3.textContent = item.Project?.name || "";

        const span4 = document.createElement('span');
        span4.className = 'message-4';
        span4.textContent = `Aporte económico: $${item.budget.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")}`;

        const span5 = document.createElement('span');
        span5.className = 'message-5';
        span5.innerHTML = `Fecha de Inicio: ${item.initDateFormatted}.<br>Fecha de Terminación: ${item.finalDateFormatted}.`;

        p2.append(span3, span4, span5);
        contain.appendChild(p2);
        boxLeft.append(img, contain);

        const boxRight = document.createElement('div');
        boxRight.className = 'box-right';

        const p6 = document.createElement('p');
        p6.className = 'message-6';

        // let texto = "";
        // if (item.systems && item.systems.length > 0) {
        //   item.systems.forEach(sys => {
        //     if (sys.progress && sys.progress.length > 0) {
        //       sys.progress.forEach(pr => {
        //         texto += (pr.description || "").replace(/\n/g, "<br>") + "<br><br>";
        //       });
        //     }
        //   });
        // }
        // p6.innerHTML = texto || "";

        boxRight.appendChild(p6);
        box.append(boxLeft, boxRight);

        personaje.insertAdjacentElement("afterend", box);
      });
    }, dependencyWithSystems);

    const { fullWidth, fullHeight } = await page.evaluate(() => {
      return {
        fullWidth: document.body.scrollWidth,
        fullHeight: document.body.scrollHeight
      };
    });

    await page.setViewport({
      width: fullWidth,
      height: fullHeight
    });

    const imgBuffer = await page.screenshot({
      clip: {
        x: 0,
        y: 0,
        width: fullWidth,
        height: fullHeight
      }
    });

    // Crear un documento PDF del tamaño de la imagen
    const doc = new PDFDocument({
      size: [fullWidth, fullHeight],
      margin: 0
    });

    const chunks = [];
    doc.on('data', (b) => chunks.push(b));
    doc.on('end', () => {});

    // Insertar la imagen ocupando toda la página
    doc.image(imgBuffer, 0, 0, { width: doc.page.width, height: doc.page.height });
    doc.end();

    const pdfBuffer = await new Promise((resolve) => {
      doc.on('end', () => resolve(Buffer.concat(chunks)));
    });

    await browser.close();
    return { file: pdfBuffer, name: `Reporte ${dependency[0].Dependency?.name ?? ''} - ${month} ${year}` };
  });
};

const getAvailableDatesService = async (path, ip, userId) => {
  try {
    const progresses = await Progress.findAll({
      attributes: ['year', 'month'],
      where: { isDelete: false },
      raw: true
    });
    
    const yearsSet = new Set();
    const monthsByYear = {};

    for (const p of progresses) {
      yearsSet.add(p.year);
      if (!monthsByYear[p.year]) monthsByYear[p.year] = new Set();
      monthsByYear[p.year].add(p.month);
    }

    const years = Array.from(yearsSet).sort((a, b) => a - b);
    const months = {};

    for (const year of years) {
      months[year] = Array.from(monthsByYear[year] || []).sort((a, b) =>
        a.localeCompare(b, 'es', { sensitivity: 'base' })
      );
    }

    return {
      years,
      months
    };
  } catch (error) {
    throw error;
  }
};

module.exports = {
  exportReportForDependencyService,
  getAvailableDatesService,
};