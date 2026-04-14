const pptxgen = require("pptxgenjs");
const React = require("react");
const ReactDOMServer = require("react-dom/server");
const sharp = require("sharp");
const { FaComments, FaFileAlt, FaChartBar, FaHandshake, FaRocket, FaClock, FaMoneyBillWave, FaUserPlus, FaSearch, FaCheck, FaArrowRight } = require("react-icons/fa");

function renderIconSvg(IconComponent, color = "#000000", size = 256) {
  return ReactDOMServer.renderToStaticMarkup(
    React.createElement(IconComponent, { color, size: String(size) })
  );
}

async function iconToBase64Png(IconComponent, color, size = 256) {
  const svg = renderIconSvg(IconComponent, color, size);
  const pngBuffer = await sharp(Buffer.from(svg)).png().toBuffer();
  return "image/png;base64," + pngBuffer.toString("base64");
}

async function main() {
  const pres = new pptxgen();
  pres.layout = "LAYOUT_16x9";
  pres.author = "Compra Inteligente";
  pres.title = "Compra Inteligente — IA para Compras Corporativas";

  // Colors
  const PURPLE = "5B4FFF";
  const PURPLE2 = "7C6FFF";
  const DARK = "16151A";
  const LIGHT_BG = "F5F4F0";
  const WHITE = "FFFFFF";
  const TEXT1 = "111010";
  const TEXT2 = "6B6A72";
  const TEXT3 = "9B9AA3";
  const SUCCESS = "1A9E6A";

  // Helper
  const mkShadow = () => ({ type: "outer", blur: 8, offset: 3, angle: 135, color: "000000", opacity: 0.1 });

  // Pre-render icons
  const iconChat = await iconToBase64Png(FaComments, "#FFFFFF", 256);
  const iconFile = await iconToBase64Png(FaFileAlt, "#FFFFFF", 256);
  const iconChart = await iconToBase64Png(FaChartBar, "#FFFFFF", 256);
  const iconHandshake = await iconToBase64Png(FaHandshake, "#FFFFFF", 256);
  const iconRocket = await iconToBase64Png(FaRocket, "#FFFFFF", 256);
  const iconClock = await iconToBase64Png(FaClock, "#" + PURPLE, 256);
  const iconMoney = await iconToBase64Png(FaMoneyBillWave, "#" + PURPLE, 256);
  const iconUserPlus = await iconToBase64Png(FaUserPlus, "#" + WHITE, 256);
  const iconSearch = await iconToBase64Png(FaSearch, "#" + WHITE, 256);
  const iconCheck = await iconToBase64Png(FaCheck, "#" + SUCCESS, 256);
  const iconArrow = await iconToBase64Png(FaArrowRight, "#" + WHITE, 256);

  // ════════════════════════════════════════
  // SLIDE 1 — CAPA
  // ════════════════════════════════════════
  let s1 = pres.addSlide();
  s1.background = { color: DARK };

  // Accent bar top
  s1.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 0.06, fill: { color: PURPLE } });

  // Brand icon circle
  s1.addShape(pres.shapes.OVAL, { x: 4.25, y: 0.8, w: 1.5, h: 1.5, fill: { color: PURPLE }, shadow: mkShadow() });
  s1.addImage({ data: iconRocket, x: 4.6, y: 1.15, w: 0.8, h: 0.8 });

  s1.addText("Compra Inteligente", { x: 0.5, y: 2.6, w: 9, h: 0.8, fontSize: 40, fontFace: "Georgia", color: WHITE, align: "center", bold: true, margin: 0 });
  s1.addText("IA para Compras Corporativas", { x: 0.5, y: 3.3, w: 9, h: 0.5, fontSize: 20, fontFace: "Calibri", color: PURPLE2, align: "center", margin: 0 });
  s1.addText("Automatize cotações, analise fornecedores e negocie melhor.", { x: 1.5, y: 4.1, w: 7, h: 0.5, fontSize: 14, fontFace: "Calibri", color: TEXT3, align: "center", margin: 0 });

  s1.addText("comprainteligente.tech", { x: 0.5, y: 5.1, w: 9, h: 0.3, fontSize: 12, fontFace: "Calibri", color: TEXT2, align: "center", margin: 0 });

  // ════════════════════════════════════════
  // SLIDE 2 — O PROBLEMA
  // ════════════════════════════════════════
  let s2 = pres.addSlide();
  s2.background = { color: LIGHT_BG };

  s2.addText("O Problema", { x: 0.7, y: 0.4, w: 8, h: 0.6, fontSize: 32, fontFace: "Georgia", color: TEXT1, bold: true, margin: 0 });
  s2.addText("Processos de compras corporativas ainda são lentos, manuais e sujeitos a erros.", { x: 0.7, y: 1.0, w: 7, h: 0.5, fontSize: 14, fontFace: "Calibri", color: TEXT2, margin: 0 });

  const problems = [
    { num: "72%", label: "das empresas ainda fazem cotações por e-mail e planilha" },
    { num: "3-5h", label: "gastas por cotação — entre pesquisa, contato e comparação" },
    { num: "15%", label: "de economia perdida por falta de negociação estruturada" },
    { num: "40%", label: "do tempo de compradores gasto em tarefas repetitivas" }
  ];

  problems.forEach((p, i) => {
    const y = 1.8 + i * 0.9;
    s2.addShape(pres.shapes.RECTANGLE, { x: 0.7, y: y, w: 8.6, h: 0.75, fill: { color: WHITE }, shadow: mkShadow() });
    s2.addShape(pres.shapes.RECTANGLE, { x: 0.7, y: y, w: 0.06, h: 0.75, fill: { color: PURPLE } });
    s2.addText(p.num, { x: 1.0, y: y, w: 1.5, h: 0.75, fontSize: 24, fontFace: "Georgia", color: PURPLE, bold: true, valign: "middle", margin: 0 });
    s2.addText(p.label, { x: 2.6, y: y, w: 6.5, h: 0.75, fontSize: 14, fontFace: "Calibri", color: TEXT1, valign: "middle", margin: 0 });
  });

  // ════════════════════════════════════════
  // SLIDE 3 — A SOLUÇÃO
  // ════════════════════════════════════════
  let s3 = pres.addSlide();
  s3.background = { color: DARK };
  s3.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 0.06, fill: { color: PURPLE } });

  s3.addText("A Solução", { x: 0.7, y: 0.4, w: 8, h: 0.6, fontSize: 32, fontFace: "Georgia", color: WHITE, bold: true, margin: 0 });
  s3.addText("Uma plataforma com IA que transforma o processo de compras.", { x: 0.7, y: 1.0, w: 8, h: 0.5, fontSize: 15, fontFace: "Calibri", color: TEXT3, margin: 0 });

  // Solution card
  s3.addShape(pres.shapes.RECTANGLE, { x: 0.7, y: 1.8, w: 8.6, h: 3.2, fill: { color: "1E1D23" }, shadow: mkShadow() });
  s3.addShape(pres.shapes.RECTANGLE, { x: 0.7, y: 1.8, w: 8.6, h: 0.06, fill: { color: PURPLE } });

  const solutions = [
    { icon: iconChat, title: "Assistente IA", desc: "Chat com especialista virtual em procurement" },
    { icon: iconFile, title: "Geração de RFQ", desc: "Cotações profissionais em segundos" },
    { icon: iconChart, title: "Análise de Cotações", desc: "Comparativo automático com recomendação" },
    { icon: iconHandshake, title: "Negociação", desc: "Estratégia com BATNA e script de abordagem" }
  ];

  solutions.forEach((s, i) => {
    const y = 2.1 + i * 0.7;
    s3.addShape(pres.shapes.OVAL, { x: 1.2, y: y + 0.05, w: 0.5, h: 0.5, fill: { color: PURPLE } });
    s3.addImage({ data: s.icon, x: 1.32, y: y + 0.17, w: 0.26, h: 0.26 });
    s3.addText(s.title, { x: 2.0, y: y, w: 3, h: 0.35, fontSize: 15, fontFace: "Calibri", color: WHITE, bold: true, valign: "middle", margin: 0 });
    s3.addText(s.desc, { x: 2.0, y: y + 0.3, w: 6, h: 0.3, fontSize: 12, fontFace: "Calibri", color: TEXT3, valign: "middle", margin: 0 });
  });

  // ════════════════════════════════════════
  // SLIDE 4 — FUNCIONALIDADES
  // ════════════════════════════════════════
  let s4 = pres.addSlide();
  s4.background = { color: LIGHT_BG };

  s4.addText("Funcionalidades", { x: 0.7, y: 0.4, w: 8, h: 0.6, fontSize: 32, fontFace: "Georgia", color: TEXT1, bold: true, margin: 0 });
  s4.addText("Quatro ferramentas com IA para cada etapa do processo de compras.", { x: 0.7, y: 1.0, w: 8, h: 0.4, fontSize: 14, fontFace: "Calibri", color: TEXT2, margin: 0 });

  const features = [
    { icon: iconChat, title: "Assistente IA", desc: "Tire dúvidas sobre sourcing, contratos, compliance, TCO e estratégia de compras com um especialista virtual." },
    { icon: iconFile, title: "Geração de RFQ", desc: "Crie Requisições de Cotação profissionais em segundos, prontas para enviar aos fornecedores." },
    { icon: iconChart, title: "Análise de Cotações", desc: "Compare propostas automaticamente com análise de TCO e recomendação fundamentada." },
    { icon: iconHandshake, title: "Apoio à Negociação", desc: "Estratégia completa com BATNA, argumentos, concessões e script de abordagem." }
  ];

  features.forEach((f, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const x = 0.7 + col * 4.5;
    const y = 1.7 + row * 1.8;

    s4.addShape(pres.shapes.RECTANGLE, { x: x, y: y, w: 4.1, h: 1.5, fill: { color: WHITE }, shadow: mkShadow() });
    s4.addShape(pres.shapes.OVAL, { x: x + 0.3, y: y + 0.25, w: 0.55, h: 0.55, fill: { color: PURPLE } });
    s4.addImage({ data: f.icon, x: x + 0.42, y: y + 0.37, w: 0.31, h: 0.31 });
    s4.addText(f.title, { x: x + 1.1, y: y + 0.2, w: 2.8, h: 0.35, fontSize: 15, fontFace: "Calibri", color: TEXT1, bold: true, valign: "middle", margin: 0 });
    s4.addText(f.desc, { x: x + 0.3, y: y + 0.75, w: 3.5, h: 0.6, fontSize: 11, fontFace: "Calibri", color: TEXT2, valign: "top", margin: 0 });
  });

  // ════════════════════════════════════════
  // SLIDE 5 — COMO FUNCIONA
  // ════════════════════════════════════════
  let s5 = pres.addSlide();
  s5.background = { color: WHITE };

  s5.addText("Como Funciona", { x: 0.7, y: 0.4, w: 8, h: 0.6, fontSize: 32, fontFace: "Georgia", color: TEXT1, bold: true, margin: 0 });
  s5.addText("Três passos para transformar seu processo de compras.", { x: 0.7, y: 1.0, w: 8, h: 0.4, fontSize: 14, fontFace: "Calibri", color: TEXT2, margin: 0 });

  const steps = [
    { num: "1", icon: iconUserPlus, title: "Crie sua conta", desc: "Cadastro rápido e sem burocracia. Comece a usar em minutos." },
    { num: "2", icon: iconSearch, title: "Descreva sua necessidade", desc: "Informe o que precisa comprar e a IA gera tudo automaticamente." },
    { num: "3", icon: iconRocket, title: "Tome decisões melhores", desc: "Use as recomendações da IA para negociar e economizar." }
  ];

  steps.forEach((st, i) => {
    const x = 0.7 + i * 3.1;
    s5.addShape(pres.shapes.RECTANGLE, { x: x, y: 1.8, w: 2.8, h: 3.0, fill: { color: LIGHT_BG }, shadow: mkShadow() });
    s5.addShape(pres.shapes.OVAL, { x: x + 0.95, y: 2.15, w: 0.9, h: 0.9, fill: { color: PURPLE } });
    s5.addImage({ data: st.icon, x: x + 1.15, y: 2.35, w: 0.5, h: 0.5 });
    s5.addText(st.title, { x: x + 0.2, y: 3.3, w: 2.4, h: 0.4, fontSize: 15, fontFace: "Calibri", color: TEXT1, bold: true, align: "center", margin: 0 });
    s5.addText(st.desc, { x: x + 0.2, y: 3.7, w: 2.4, h: 0.8, fontSize: 12, fontFace: "Calibri", color: TEXT2, align: "center", margin: 0 });
  });

  // ════════════════════════════════════════
  // SLIDE 6 — BENEFÍCIOS E ROI
  // ════════════════════════════════════════
  let s6 = pres.addSlide();
  s6.background = { color: LIGHT_BG };

  s6.addText("Benefícios e ROI", { x: 0.7, y: 0.4, w: 8, h: 0.6, fontSize: 32, fontFace: "Georgia", color: TEXT1, bold: true, margin: 0 });
  s6.addText("O retorno se paga no primeiro mês.", { x: 0.7, y: 1.0, w: 8, h: 0.4, fontSize: 14, fontFace: "Calibri", color: TEXT2, margin: 0 });

  const stats = [
    { num: "5-15%", label: "Redução de custos\nnas compras" },
    { num: "20%", label: "Economia de tempo\ndos compradores" },
    { num: "3x", label: "Mais rápido na\ngeração de RFQs" },
    { num: "100%", label: "Negociações com\nestratégia fundamentada" }
  ];

  stats.forEach((st, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const x = 0.7 + col * 4.5;
    const y = 1.7 + row * 1.7;

    s6.addShape(pres.shapes.RECTANGLE, { x: x, y: y, w: 4.1, h: 1.4, fill: { color: WHITE }, shadow: mkShadow() });
    s6.addText(st.num, { x: x + 0.3, y: y + 0.15, w: 1.6, h: 1.1, fontSize: 36, fontFace: "Georgia", color: PURPLE, bold: true, valign: "middle", margin: 0 });
    s6.addText(st.label, { x: x + 2.0, y: y + 0.15, w: 1.9, h: 1.1, fontSize: 13, fontFace: "Calibri", color: TEXT1, valign: "middle", margin: 0 });
  });

  // ════════════════════════════════════════
  // SLIDE 7 — PLANO E PREÇO
  // ════════════════════════════════════════
  let s7 = pres.addSlide();
  s7.background = { color: WHITE };

  s7.addText("Plano e Preço", { x: 0.7, y: 0.4, w: 8, h: 0.6, fontSize: 32, fontFace: "Georgia", color: TEXT1, bold: true, margin: 0 });

  // Price card left
  s7.addShape(pres.shapes.RECTANGLE, { x: 0.7, y: 1.3, w: 4.1, h: 3.8, fill: { color: DARK }, shadow: mkShadow() });
  s7.addShape(pres.shapes.RECTANGLE, { x: 0.7, y: 1.3, w: 4.1, h: 0.06, fill: { color: PURPLE } });

  s7.addText("PLANO CORPORATIVO", { x: 1.1, y: 1.6, w: 3.3, h: 0.3, fontSize: 11, fontFace: "Calibri", color: PURPLE2, charSpacing: 2, margin: 0 });
  s7.addText([
    { text: "R$ ", options: { fontSize: 18, color: TEXT3 } },
    { text: "800", options: { fontSize: 48, color: WHITE, fontFace: "Georgia" } },
    { text: " /mês", options: { fontSize: 14, color: TEXT3 } }
  ], { x: 1.1, y: 2.0, w: 3.3, h: 0.8, margin: 0 });

  s7.addText("7 dias de teste grátis", { x: 1.1, y: 2.8, w: 3.3, h: 0.3, fontSize: 13, fontFace: "Calibri", color: SUCCESS, bold: true, margin: 0 });

  // Features list right
  s7.addShape(pres.shapes.RECTANGLE, { x: 5.2, y: 1.3, w: 4.1, h: 3.8, fill: { color: LIGHT_BG }, shadow: mkShadow() });
  s7.addText("O QUE ESTÁ INCLUÍDO", { x: 5.6, y: 1.6, w: 3.3, h: 0.3, fontSize: 11, fontFace: "Calibri", color: TEXT2, charSpacing: 2, margin: 0 });

  const includes = [
    "Assistente IA ilimitado",
    "Geração automática de RFQ",
    "Análise comparativa de cotações",
    "Estratégia de negociação com BATNA",
    "Histórico de conversas salvo",
    "Acesso web — sem instalação",
    "Suporte por e-mail e WhatsApp"
  ];

  includes.forEach((item, i) => {
    const y = 2.1 + i * 0.38;
    s7.addImage({ data: iconCheck, x: 5.6, y: y + 0.05, w: 0.22, h: 0.22 });
    s7.addText(item, { x: 5.95, y: y, w: 3.0, h: 0.32, fontSize: 12, fontFace: "Calibri", color: TEXT1, valign: "middle", margin: 0 });
  });

  // ════════════════════════════════════════
  // SLIDE 8 — CTA
  // ════════════════════════════════════════
  let s8 = pres.addSlide();
  s8.background = { color: DARK };
  s8.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 0.06, fill: { color: PURPLE } });

  s8.addShape(pres.shapes.OVAL, { x: 4.25, y: 0.8, w: 1.5, h: 1.5, fill: { color: PURPLE }, shadow: mkShadow() });
  s8.addImage({ data: iconRocket, x: 4.6, y: 1.15, w: 0.8, h: 0.8 });

  s8.addText("Pronto para comprar melhor?", { x: 0.5, y: 2.6, w: 9, h: 0.7, fontSize: 36, fontFace: "Georgia", color: WHITE, align: "center", bold: true, margin: 0 });
  s8.addText("Comece a usar a IA a favor do seu departamento de compras.", { x: 1.5, y: 3.3, w: 7, h: 0.4, fontSize: 15, fontFace: "Calibri", color: TEXT3, align: "center", margin: 0 });

  // CTA button
  s8.addShape(pres.shapes.RECTANGLE, { x: 3.3, y: 4.0, w: 3.4, h: 0.6, fill: { color: PURPLE }, shadow: mkShadow() });
  s8.addText("Teste grátis por 7 dias", { x: 3.3, y: 4.0, w: 3.4, h: 0.6, fontSize: 15, fontFace: "Calibri", color: WHITE, bold: true, align: "center", valign: "middle", margin: 0 });

  s8.addText("comprainteligente.tech", { x: 0.5, y: 4.8, w: 9, h: 0.3, fontSize: 14, fontFace: "Calibri", color: PURPLE2, align: "center", margin: 0 });
  s8.addText("contato@comprainteligente.tech", { x: 0.5, y: 5.1, w: 9, h: 0.3, fontSize: 12, fontFace: "Calibri", color: TEXT3, align: "center", margin: 0 });

  // Save
  await pres.writeFile({ fileName: "/Users/marcelo/Documents/procureai/CompraInteligente-Marketing.pptx" });
  console.log("Apresentação criada: CompraInteligente-Marketing.pptx");
}

main().catch(console.error);
