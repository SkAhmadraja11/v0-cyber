/**
 * PhiusGuard Gmail Add-on
 * Principal Security Architect & Mobile Platform Engineer
 */

function getContextualAddOn(e) {
  var messageId = e.gmail.messageId;
  var accessToken = e.gmail.accessToken;
  GmailApp.setCurrentMessageAccessToken(accessToken);
  
  var message = GmailApp.getMessageById(messageId);
  var sender = message.getFrom();
  var subject = message.getSubject();
  var content = message.getPlainBody();
  
  // Call PhiusGuard API
  var scanResults = analyzeEmail(sender, content);
  
  return createSecurityCard(scanResults);
}

function analyzeEmail(sender, content) {
  var url = "https://next-gen-cyber.vercel.app/api/real-scan"; // Production endpoint
  var payload = {
    type: "email",
    content: content,
    metadata: {
      sender: sender
    }
  };
  
  var options = {
    'method' : 'post',
    'contentType': 'application/json',
    'payload' : JSON.stringify(payload),
    'muteHttpExceptions': true
  };
  
  try {
    var response = UrlFetchApp.fetch(url, options);
    return JSON.parse(response.getContentText());
  } catch (e) {
    return { verdict: "API_ERROR", risk_score: 0, explanation: "Could not reach detection server." };
  }
}

function createSecurityCard(results) {
  var builder = CardService.newCardBuilder();
  
  var header = CardService.newCardHeader()
    .setTitle("PhiusGuard Security Scan")
    .setSubtitle("Verdict: " + results.verdict);
    
  if (results.verdict === "MALICIOUS" || results.verdict === "HIGH_RISK") {
    header.setImageUrl("https://img.icons8.com/color/96/shield-error.png");
  } else {
    header.setImageUrl("https://img.icons8.com/color/96/checked-shield.png");
  }

  var section = CardService.newCardSection()
    .setHeader("Risk Analysis");
    
  section.addWidget(CardService.newKeyValue()
    .setTopLabel("Risk Score")
    .setContent(results.risk_score + "/100")
    .setIcon(CardService.Icon.CONFIRMATION_NUMBER_ICON));

  section.addWidget(CardService.newTextParagraph()
    .setText("<b>Findings:</b> " + (results.key_indicators ? results.key_indicators.join(", ") : "None")));

  section.addWidget(CardService.newDecoratedText()
    .setText(results.explanation || "No immediate threats identified.")
    .setWrapText(true));

  builder.addSection(section);
  builder.setHeader(header);
  
  return builder.build();
}
