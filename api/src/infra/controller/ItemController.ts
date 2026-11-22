import CreateItemUseCase from "../../application/usecase/item/CreateItem";
import DeleteItemUseCase from "../../application/usecase/item/DeleteItem";
import GetItemUseCase from "../../application/usecase/item/GetItem";
import GetItemsUseCase from "../../application/usecase/item/GetItems";
import GetMostUsedItemsUseCase from "../../application/usecase/item/GetMostUsedItems";
import { ItemInput } from "../../application/usecase/item/ItemMutation";
import UpdateItemUseCase from "../../application/usecase/item/UpdateItem";
import HandleId from "../http/HandleId";
import HandleItemSort from "../http/HandleItemSort";
import HandleLimit from "../http/HandleLimit";
import HandlePagination from "../http/HandlePagination";
import HandleSearch from "../http/HandleSearch";
import HttpServer from "../http/HttpServer";

const MOST_USED_LIMITS = { defaultLimit: 5, maxLimit: 20 };

export default class ItemController {
  constructor(
    readonly httpServer: HttpServer,
    readonly createItem: CreateItemUseCase,
    readonly getItems: GetItemsUseCase,
    readonly getItem: GetItemUseCase,
    readonly updateItem: UpdateItemUseCase,
    readonly deleteItem: DeleteItemUseCase,
    readonly getMostUsedItems: GetMostUsedItemsUseCase,
  ) {
    httpServer.register(
      "post",
      "/items",
      async (_params, body) => createItem.execute(body as ItemInput),
      201,
    );
    httpServer.register("get", "/items", async (_params, _body, query) => {
      const pagination = new HandlePagination(query);
      const search = new HandleSearch(query.search);
      const sort = new HandleItemSort(query);
      return getItems.execute({
        ...pagination.getValue(),
        search: search.getValue(),
        sort: sort.getValue(),
      });
    });
    httpServer.register("get", "/items/most-used", async (_params, _body, query) => {
      const limit = new HandleLimit(query.limit, MOST_USED_LIMITS);
      return getMostUsedItems.execute(limit.getValue());
    });
    httpServer.register("get", "/items/:itemId", async (params) => {
      const itemId = new HandleId(params.itemId);
      return getItem.execute(itemId.getValue());
    });
    httpServer.register("put", "/items/:itemId", async (params, body) => {
      const itemId = new HandleId(params.itemId);
      return updateItem.execute(itemId.getValue(), body as ItemInput);
    });
    httpServer.register("delete", "/items/:itemId", async (params) => {
      const itemId = new HandleId(params.itemId);
      return deleteItem.execute(itemId.getValue());
    });
  }
}
