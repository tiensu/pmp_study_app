function jsonResponse(body, status = 200) {
  return {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8' },
    body: JSON.stringify(body),
  };
}

export function createSessionsRoutes({ sessionService }) {
  return async function handleSessionsRoute(request) {
    if (request.method === 'POST' && request.pathname === '/api/sessions') {
      const session = await sessionService.startSession(request.body);
      return jsonResponse(session, 201);
    }

    const sessionMatch = request.pathname.match(/^\/api\/sessions\/(\d+)$/);
    if (request.method === 'GET' && sessionMatch) {
      const [, sessionId] = sessionMatch;
      return jsonResponse(await sessionService.getSession(Number(sessionId)));
    }

    const questionMatch = request.pathname.match(/^\/api\/sessions\/(\d+)\/questions\/(\d+)$/);
    if (request.method === 'GET' && questionMatch) {
      const [, sessionId, questionNumber] = questionMatch;
      return jsonResponse(await sessionService.getQuestion(Number(sessionId), Number(questionNumber)));
    }

    const answersMatch = request.pathname.match(/^\/api\/sessions\/(\d+)\/answers$/);
    if (request.method === 'POST' && answersMatch) {
      const [, sessionId] = answersMatch;
      return jsonResponse(await sessionService.submitAnswer(Number(sessionId), request.body));
    }

    const completeMatch = request.pathname.match(/^\/api\/sessions\/(\d+)\/complete$/);
    if (request.method === 'POST' && completeMatch) {
      const [, sessionId] = completeMatch;
      return jsonResponse(await sessionService.completeSession(Number(sessionId)));
    }

    const resultMatch = request.pathname.match(/^\/api\/sessions\/(\d+)\/results$/);
    if (request.method === 'GET' && resultMatch) {
      const [, sessionId] = resultMatch;
      return jsonResponse(await sessionService.getResults(Number(sessionId)));
    }

    return null;
  };
}
