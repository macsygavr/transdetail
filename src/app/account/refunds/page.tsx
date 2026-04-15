import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function Page() {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Номер возврата</TableHead>
          <TableHead>Дата возврата</TableHead>
          <TableHead>Номер заказа</TableHead>
          <TableHead>Товар</TableHead>
          <TableHead>Статус</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell>101</TableCell>
          <TableCell>17.02.2022</TableCell>
          <TableCell>
            <span className="text-main-red">№ 289 от 16.02.2022</span>
          </TableCell>
          <TableCell>
            <span className="text-main-red">10 товаров</span>
          </TableCell>
          <TableCell>
            <Badge variant="five">Закрыт</Badge>
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell>101</TableCell>
          <TableCell>17.02.2022</TableCell>
          <TableCell>
            <span className="text-main-red">№ 289 от 16.02.2022</span>
          </TableCell>
          <TableCell>
            <span className="text-main-red">10 товаров</span>
          </TableCell>
          <TableCell>
            <Badge variant="three">Закрыт</Badge>
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell>101</TableCell>
          <TableCell>17.02.2022</TableCell>
          <TableCell>
            <span className="text-main-red">№ 289 от 16.02.2022</span>
          </TableCell>
          <TableCell>
            <span className="text-main-red">10 товаров</span>
          </TableCell>
          <TableCell>
            <Badge variant="four">Закрыт</Badge>
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  );
}
