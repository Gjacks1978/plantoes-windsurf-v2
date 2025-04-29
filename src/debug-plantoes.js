// Script para debug do localStorage
console.log("=== DEBUG PLANTOES ===");
console.log("Verificando localStorage...");

// Verificar se o localStorage está disponível
if (typeof localStorage !== 'undefined') {
  try {
    // Verificar dados de plantões
    const plantoesData = localStorage.getItem("plantoes-dados");
    console.log("plantoes-dados encontrado:", !!plantoesData);
    
    if (plantoesData) {
      const plantoes = JSON.parse(plantoesData);
      console.log("Número de plantões:", plantoes.length);
      console.log("Primeiro plantão:", plantoes[0]);
    } else {
      console.log("Nenhum dado de plantões encontrado");
    }
    
    // Verificar dados de locais
    const locaisData = localStorage.getItem("locais-dados");
    console.log("locais-dados encontrado:", !!locaisData);
    
    if (locaisData) {
      const locais = JSON.parse(locaisData);
      console.log("Número de locais:", locais.length);
      console.log("Primeiro local:", locais[0]);
    } else {
      console.log("Nenhum dado de locais encontrado");
    }
    
    // Listar todas as chaves no localStorage
    console.log("Todas as chaves no localStorage:");
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      console.log(`- ${key}`);
    }
  } catch (error) {
    console.error("Erro ao acessar localStorage:", error);
  }
} else {
  console.log("localStorage não está disponível");
}

console.log("=== FIM DEBUG ===");
