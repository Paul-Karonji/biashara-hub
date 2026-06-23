import { MedusaContainer } from "@medusajs/framework";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";

export default async function delete_admin_user({
  container,
}: {
  container: MedusaContainer;
}) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const pgConnection = container.resolve(ContainerRegistrationKeys.PG_CONNECTION);

  logger.info("Starting deletion of user: admin@biasharahub.co.ke");

  try {
    // 1. Delete from auth_user or user tables
    // In Medusa v2, the User table is called "user"
    const userDel = await pgConnection.raw('DELETE FROM "user" WHERE email = ?', ['admin@biasharahub.co.ke']);
    logger.info(`Deleted from "user" table. Rows affected: ${userDel.rowCount}`);

    // In Medusa v2, Auth Identity stores the auth credentials
    // We search the database tables to see which ones contain our email
    const tablesRes = await pgConnection.raw(`
      SELECT table_name, column_name 
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
        AND (column_name = 'email' OR column_name = 'identifier' OR column_name = 'user_id' OR column_name LIKE '%identity%')
    `);

    for (const row of tablesRes.rows) {
      const { table_name, column_name } = row;
      try {
        // Query to check if our email exists in this table/column
        const checkRes = await pgConnection.raw(`SELECT COUNT(*) FROM "${table_name}" WHERE CAST("${column_name}" AS TEXT) = ?`, ['admin@biasharahub.co.ke']);
        const count = parseInt(checkRes.rows[0].count);
        if (count > 0) {
          logger.info(`Found ${count} row(s) in table "${table_name}" (column "${column_name}") containing email.`);
          const delRes = await pgConnection.raw(`DELETE FROM "${table_name}" WHERE CAST("${column_name}" AS TEXT) = ?`, ['admin@biasharahub.co.ke']);
          logger.info(`Deleted from "${table_name}". Rows affected: ${delRes.rowCount}`);
        }
      } catch (err) {
        // Ignore errors for incompatible columns/tables
      }
    }

    // Let's also search and delete from auth_identity where provider_identities or credentials might match
    // In Medusa v2, auth_identity holds provider_metadata or similar json fields
    try {
      const authIdentityTables = ['auth_identity', 'auth_user', 'provider_identity'];
      for (const table of authIdentityTables) {
        // Check if table exists
        const tableCheck = await pgConnection.raw(`
          SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'public' AND table_name = ?
          )
        `, [table]);
        
        if (tableCheck.rows[0].exists) {
          // If the table exists, let's delete anything that matches our email in any text representation
          // Or delete row if any column contains the text 'admin@biasharahub.co.ke'
          logger.info(`Checking table "${table}" for raw text matches...`);
          // Let's search columns of type text/varchar/jsonb
          const colsRes = await pgConnection.raw(`
            SELECT column_name FROM information_schema.columns 
            WHERE table_schema = 'public' AND table_name = ?
          `, [table]);
          
          for (const col of colsRes.rows) {
            const colName = col.column_name;
            try {
              const checkMatch = await pgConnection.raw(`
                SELECT COUNT(*) FROM "${table}" WHERE CAST("${colName}" AS TEXT) LIKE '%admin@biasharahub.co.ke%'
              `);
              const count = parseInt(checkMatch.rows[0].count);
              if (count > 0) {
                logger.info(`Found ${count} row(s) in "${table}" (column "${colName}") matching query.`);
                const delMatch = await pgConnection.raw(`
                  DELETE FROM "${table}" WHERE CAST("${colName}" AS TEXT) LIKE '%admin@biasharahub.co.ke%'
                `);
                logger.info(`Deleted from "${table}" using column "${colName}". Rows affected: ${delMatch.rowCount}`);
              }
            } catch (err) {
              // Ignore
            }
          }
        }
      }
    } catch (err) {
      logger.error(`Error deleting from auth tables: ${err.message}`);
    }

    logger.info("Deletion completed successfully!");
  } catch (error) {
    logger.error(`Failed to delete user: ${error.message}`);
  }
}
