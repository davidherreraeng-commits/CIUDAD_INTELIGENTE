async function applyPagination({
  model,
  where,
  include,
  page,
  limit,
  order,
  transaction
}) {
  const offset = (page - 1) * limit;

  const total = await model.count({
    where,
    include,
    transaction
  });

  const results = await model.findAll({
    where,
    include,
    limit,
    offset,
    order,
    transaction
  });

  return {
    total,
    results,
    totalPages: Math.ceil(total / limit)
  };
}

module.exports = { applyPagination };