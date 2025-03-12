export const formatTransactionsToMarkdown = (dataToSave: any): string => {
  let markdown = `# Financial Summary\n\n`;

  // Format total income, expenses, and net change
  markdown += `## Totals\n`;
  markdown += `- **Income:** $${dataToSave.totals.income}\n`;
  markdown += `- **Expenses:** $${dataToSave.totals.expenses}\n`;
  markdown += `- **Net Change:** $${dataToSave.totals.netChange}\n\n`;

  // Iterate over each month's transactions
  markdown += `## Monthly Breakdown\n\n`;
  for (const [month, details] of Object.entries(dataToSave.transactions)) {
    const monthDetails = details as {
      income: number;
      expenses: number;
      transactions: any[];
    };
    markdown += `### ${month}\n`;
    markdown += `- **Income:** $${monthDetails.income}\n`;
    markdown += `- **Expenses:** $${monthDetails.expenses}\n\n`;

    // Transactions List
    markdown += `#### Transactions:\n`;
    monthDetails.transactions.forEach((t: any) => {
      markdown += `- **${t.description}**\n`;
      markdown += `  - **Amount:** $${t.amount}\n`;
      markdown += `  - **Category:** ${t.category}\n`;
      markdown += `  - **Date:** ${t.date}\n\n`;
    });

    // Recurring Expenses
    if ((details as any).recurringExpenses?.size > 0) {
      markdown += `#### Recurring Expenses:\n`;
      (details as any).recurringExpenses.forEach(
        (expense: any, desc: string) => {
          markdown += `- **${desc}**\n`;
          markdown += `  - **Amount:** $${expense.amount}\n`;
          markdown += `  - **Category:** ${expense.category}\n`;
          markdown += `  - **Frequency:** ${expense.frequency}\n\n`;
        }
      );
    }
  }

  return markdown;
};
